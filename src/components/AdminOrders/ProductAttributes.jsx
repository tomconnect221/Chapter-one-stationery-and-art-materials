import React from 'react';

const knownFields = [
  ['sku', 'SKU'],
  ['category', 'Category'],
  ['brand', 'Brand'],
  ['model', 'Model'],
  ['color', 'Color'],
  ['size', 'Size'],
  ['dimensions', 'Dimensions'],
  ['barcode', 'Barcode'],
  ['warranty_period', 'Warranty'],
];

const getVariantOptions = (item) => {
  const options = item?.variant_options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return options && typeof options === 'object' && !Array.isArray(options) ? options : {};
};

const formatValue = (key, value) => {
  if (key === 'warranty_period' && Number.isFinite(Number(value))) {
    return `${value} month${Number(value) === 1 ? '' : 's'}`;
  }
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return Object.values(value).filter(Boolean).join(', ');
  return String(value);
};

const toLabel = (key) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const ProductAttributes = ({ item }) => {
  const product = item?.product || {};
  const variant = item?.variant || item?.product_variant || {};
  const options = getVariantOptions(item);

  const values = {
    sku: options.sku ?? variant.sku ?? product.sku,
    category: product.category?.name,
    brand: product.brand,
    model: product.model,
    color: options.color ?? variant.color ?? product.color,
    size: options.size ?? variant.size ?? product.size,
    dimensions: options.dimensions ?? variant.dimensions ?? product.dimensions,
    barcode: product.barcode,
    warranty_period: product.warranty_period,
  };
  const fields = knownFields
    .filter(([key]) => values[key] !== null && values[key] !== undefined && values[key] !== '')
    .map(([key, label]) => ({ key, label, value: values[key] }));
  const knownKeys = new Set(knownFields.map(([key]) => key));

  Object.entries(options).forEach(([key, value]) => {
    if (!knownKeys.has(key) && value !== null && value !== undefined && value !== '') {
      fields.push({ key, label: toLabel(key), value });
    }
  });

  if (fields.length === 0) return null;

  return (
    <div className="order-item-grid" aria-label="Product details">
      {fields.map(({ key, label, value }) => (
        <div className="order-item-grid-item" key={key}>
          <label>{label}</label>
          <p className={key === 'sku' ? 'mono' : undefined}>{formatValue(key, value)}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductAttributes;
