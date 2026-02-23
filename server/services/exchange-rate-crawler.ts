import * as cheerio from 'cheerio';
import { getSupabaseClient } from '../storage/database/supabase-client';

/**
 * 中国银行外汇牌价爬虫
 * 数据来源：https://www.boc.cn/sourcedb/whpj/
 * 
 * 汇率说明：
 * - 现汇买入价：银行从客户手中买入外汇的价格（客户卖外汇给银行）
 * - 现钞买入价：银行从客户手中买入外币现钞的价格
 * - 现汇卖出价：银行向客户卖出外汇的价格（客户从银行买外汇）- 我们用这个
 * - 现钞卖出价：银行向客户卖出外币现钞的价格
 * - 中行折算价：中国银行内部折算用的中间价
 */

const BOC_RATE_URL = 'https://www.boc.cn/sourcedb/whpj/index.html';

// 币种代码映射（中国银行名称 -> 标准代码）
const CURRENCY_MAP: Record<string, string> = {
  '欧元': 'EUR',
  '美元': 'USD',
  '英镑': 'GBP',
  '港币': 'HKD',
  '日元': 'JPY',
  '澳大利亚元': 'AUD',
  '加拿大元': 'CAD',
  '瑞士法郎': 'CHF',
  '新加坡元': 'SGD',
  '新西兰元': 'NZD',
  '韩国元': 'KRW',
  '泰国铢': 'THB',
  '马来西亚林吉特': 'MYR',
  '俄罗斯卢布': 'RUB',
  '南非兰特': 'ZAR',
};

interface BocRateInfo {
  currency: string;       // 币种代码
  currencyName: string;   // 币种中文名
  buyingRate: number;     // 现汇买入价
  sellingRate: number;    // 现汇卖出价（我们用这个）
  cashBuyingRate: number; // 现钞买入价
  cashSellingRate: number;// 现钞卖出价
  middleRate: number;     // 中行折算价
  date: string;           // 发布日期
  time: string;           // 发布时间
}

/**
 * 抓取中国银行外汇牌价页面
 */
export async function fetchBocRates(): Promise<BocRateInfo[]> {
  try {
    const response = await fetch(BOC_RATE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return parseBocRatesHtml(html);
  } catch (error) {
    console.error('Failed to fetch BOC rates:', error);
    throw error;
  }
}

/**
 * 解析中国银行外汇牌价HTML
 */
function parseBocRatesHtml(html: string): BocRateInfo[] {
  const $ = cheerio.load(html);
  const rates: BocRateInfo[] = [];

  // 查找汇率表格
  const table = $('table').filter((_, el) => {
    const text = $(el).text();
    return text.includes('货币名称') && text.includes('现汇买入价');
  }).first();

  if (table.length === 0) {
    console.error('Could not find exchange rate table');
    return [];
  }

  // 使用当前日期作为默认值（中国银行网站可能没有明确的日期格式）
  const today = new Date();
  const publishDate = today.toISOString().split('T')[0];
  const publishTime = today.toTimeString().split(' ')[0];

  // 解析表格行
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 7) return;

    const currencyName = $(cells[0]).text().trim();
    
    // 跳过表头
    if (currencyName === '货币名称' || !currencyName) return;

    const currencyCode = CURRENCY_MAP[currencyName];
    if (!currencyCode) return; // 跳过我们不关心的币种

    const buyingRate = parseFloat($(cells[1]).text().trim()) || 0;      // 现汇买入价
    const cashBuyingRate = parseFloat($(cells[2]).text().trim()) || 0;  // 现钞买入价
    const sellingRate = parseFloat($(cells[3]).text().trim()) || 0;     // 现汇卖出价
    const cashSellingRate = parseFloat($(cells[4]).text().trim()) || 0; // 现钞卖出价
    const middleRate = parseFloat($(cells[5]).text().trim()) || 0;      // 中行折算价

    // 中行牌价是以100外币为单位的，需要除以100
    rates.push({
      currency: currencyCode,
      currencyName,
      buyingRate: buyingRate / 100,
      sellingRate: sellingRate / 100,
      cashBuyingRate: cashBuyingRate / 100,
      cashSellingRate: cashSellingRate / 100,
      middleRate: middleRate / 100,
      date: publishDate,
      time: publishTime,
    });
  });

  return rates;
}

/**
 * 将中国银行汇率转换为标准格式（相对于人民币）
 * 中国银行牌价是 1外币 = X人民币
 * 我们需要存储：from_currency -> to_currency -> rate
 */
function convertToStandardRates(bocRates: BocRateInfo[]): Array<{
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_date: string;
  source: string;
}> {
  const standardRates: Array<{
    from_currency: string;
    to_currency: string;
    rate: number;
    rate_date: string;
    source: string;
  }> = [];

  const rateDate = bocRates[0]?.date || new Date().toISOString().split('T')[0];

  for (const rate of bocRates) {
    // 现汇卖出价：客户从银行买外汇的价格（外币 -> 人民币）
    // 例如 EUR 卖出价 7.85，意味着 1 EUR = 7.85 CNY
    standardRates.push({
      from_currency: rate.currency,
      to_currency: 'CNY',
      rate: rate.sellingRate, // 使用现汇卖出价
      rate_date: rateDate,
      source: 'BANK_OF_CHINA',
    });

    // 反向汇率（人民币 -> 外币）
    if (rate.sellingRate > 0) {
      standardRates.push({
        from_currency: 'CNY',
        to_currency: rate.currency,
        rate: 1 / rate.sellingRate,
        rate_date: rateDate,
        source: 'BANK_OF_CHINA',
      });
    }

    // 计算交叉汇率（外币 -> 外币）
    // 例如 EUR->USD = EUR->CNY * CNY->USD
  }

  // 添加主要交叉汇率
  const eurRate = bocRates.find(r => r.currency === 'EUR');
  const usdRate = bocRates.find(r => r.currency === 'USD');
  const gbpRate = bocRates.find(r => r.currency === 'GBP');
  const hkdRate = bocRates.find(r => r.currency === 'HKD');

  if (eurRate && usdRate && usdRate.sellingRate > 0) {
    // EUR -> USD = EUR/CNY ÷ USD/CNY
    standardRates.push({
      from_currency: 'EUR',
      to_currency: 'USD',
      rate: eurRate.sellingRate / usdRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
    standardRates.push({
      from_currency: 'USD',
      to_currency: 'EUR',
      rate: usdRate.sellingRate / eurRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
  }

  if (eurRate && gbpRate && gbpRate.sellingRate > 0) {
    standardRates.push({
      from_currency: 'EUR',
      to_currency: 'GBP',
      rate: eurRate.sellingRate / gbpRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
    standardRates.push({
      from_currency: 'GBP',
      to_currency: 'EUR',
      rate: gbpRate.sellingRate / eurRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
  }

  if (usdRate && hkdRate && hkdRate.sellingRate > 0) {
    standardRates.push({
      from_currency: 'USD',
      to_currency: 'HKD',
      rate: usdRate.sellingRate / hkdRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
    standardRates.push({
      from_currency: 'HKD',
      to_currency: 'USD',
      rate: hkdRate.sellingRate / usdRate.sellingRate,
      rate_date: rateDate,
      source: 'BANK_OF_CHINA_CALCULATED',
    });
  }

  return standardRates;
}

/**
 * 同步汇率到数据库
 */
export async function syncRatesToDatabase(): Promise<{
  success: boolean;
  count: number;
  rates: BocRateInfo[];
  message: string;
}> {
  try {
    console.log('Starting to fetch BOC rates...');
    const bocRates = await fetchBocRates();
    
    if (bocRates.length === 0) {
      return {
        success: false,
        count: 0,
        rates: [],
        message: 'No rates fetched from BOC',
      };
    }

    console.log(`Fetched ${bocRates.length} rates from BOC`);
    
    const standardRates = convertToStandardRates(bocRates);
    console.log(`Converted to ${standardRates.length} standard rates`);

    // 存入数据库
    const client = getSupabaseClient();
    const ratesToInsert = standardRates.map(r => ({
      ...r,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('exchange_rates')
      .upsert(ratesToInsert, {
        onConflict: 'rate_date,from_currency,to_currency',
      });

    if (error) {
      console.error('Failed to save rates to database:', error);
      return {
        success: false,
        count: 0,
        rates: bocRates,
        message: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      count: ratesToInsert.length,
      rates: bocRates,
      message: `Successfully synced ${ratesToInsert.length} exchange rates`,
    };
  } catch (error) {
    console.error('Failed to sync rates:', error);
    return {
      success: false,
      count: 0,
      rates: [],
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取指定日期的汇率（如果没有则返回最新）
 */
export async function getRateForDate(
  fromCurrency: string,
  toCurrency: string,
  date?: string
): Promise<number | null> {
  const client = getSupabaseClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // 先查找指定日期的汇率
  const { data: exactRate } = await client
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .eq('rate_date', targetDate)
    .single();

  if (exactRate) {
    return exactRate.rate;
  }

  // 如果没有，查找最近的汇率
  const { data: latestRate } = await client
    .from('exchange_rates')
    .select('rate, rate_date')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .lte('rate_date', targetDate)
    .order('rate_date', { ascending: false })
    .limit(1)
    .single();

  return latestRate?.rate || null;
}

export type { BocRateInfo };
