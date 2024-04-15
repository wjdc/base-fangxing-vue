/**
 * 空值横杠
 * @param {*} value
 * @returns
 */

export function blankFilter(value) {
  if (value === null || value === undefined || value === "") {
    return "-"; // 空值时显示横杠字符
  }
  return value; // 其他情况返回原值
}

/**
 * 价格金额格式化小数点后两位
 * @param { Number|String } price
 * @returns
 */

export function priceFilter(price) {
  if (price === null || price === undefined || price === "") {
    return "-";
  }
  if (typeof price === "string") {
    const trimmedPrice = price.trim();
    if (!Number.isNaN(Number(trimmedPrice))) {
      return Number(trimmedPrice).toFixed(2);
    }
    return trimmedPrice;
  }
  return Number(price.toFixed(2)).toFixed(2);
}

