/**
 * Email templates for various notifications
 */

/**
 * Generate HTML for order confirmation email
 * 
 * @param {Object} order - Order object
 * @param {Object} customer - Customer object
 * @param {Array} items - Order items
 * @returns {string} - HTML email content
 */
export const orderConfirmationTemplate = (order, customer, items) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const tax = order.tax_amount || 0;
  const shipping = order.shipping_amount || 0;
  const total = order.total_amount || (subtotal + tax + shipping);

  // Format shipping/billing address if available
  const formatAddress = (address) => {
    if (!address) return 'Not provided';
    
    return `
      ${address.street || ''} ${address.number || ''}<br>
      ${address.district ? `${address.district}<br>` : ''}
      ${address.city || ''}, ${address.state || ''} ${address.zip_code || ''}<br>
      ${address.country || ''}
    `;
  };

  // Generate items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EEE;">
        ${item.product?.name || 'Product'}
        ${item.variant?.name ? `<br><small style="color: #777;">${item.variant.name}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: right;">${formatCurrency(item.unit_price || 0)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #EEE; text-align: right;">${formatCurrency(item.total_price || 0)}</td>
    </tr>
  `).join('');

  // Get estimated delivery date (14 days from order date)
  const orderDate = new Date(order.placed_at || new Date());
  const estimatedDelivery = new Date(orderDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0d6efd; padding: 20px; text-align: center; color: white; }
        .content { padding: 20px; background-color: #fff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .order-summary { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 12px; text-align: left; background-color: #f8f9fa; }
        .divider { height: 1px; background-color: #eee; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customer?.user?.name || 'Valued Customer'},</p>
          
          <p>Thank you for your order! We're pleased to confirm that we've received your order and are processing it now.</p>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery.toLocaleDateString()}</p>
          </div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 12px; text-align: right;">${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Tax:</strong></td>
                <td style="padding: 12px; text-align: right;">${formatCurrency(tax)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 12px; text-align: right;">${formatCurrency(shipping)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 12px; text-align: right;"><strong>${formatCurrency(total)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="divider"></div>
          
          <table>
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <h3>Shipping Address</h3>
                <p>${formatAddress(order.shipping_address)}</p>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <h3>Billing Address</h3>
                <p>${formatAddress(order.billing_address)}</p>
              </td>
            </tr>
          </table>
          
          <div class="divider"></div>
          
          <p>You can track your order's status by logging into your account and visiting the Orders section.</p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order Details</a>
          </p>
        </div>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact our customer support at support@alitools.com</p>
          <p>&copy; ${new Date().getFullYear()} AliTools B2B. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML for order shipment notification email
 * 
 * @param {Object} order - Order object
 * @param {Object} shipment - Shipment object
 * @param {Object} customer - Customer object
 * @returns {string} - HTML email content
 */
export const orderShipmentTemplate = (order, shipment, customer) => {
  // Format the shipping date
  const shippingDate = new Date(shipment.shipping_date || new Date());
  
  // Estimated delivery date
  const estimatedDelivery = shipment.estimated_delivery
    ? new Date(shipment.estimated_delivery)
    : new Date(shippingDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Shipped</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; padding: 20px; text-align: center; color: white; }
        .content { padding: 20px; background-color: #fff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .shipping-info { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .divider { height: 1px; background-color: #eee; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
        .tracking-number { font-family: monospace; background-color: #f8f9fa; padding: 8px; display: inline-block; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order Has Shipped!</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customer?.user?.name || 'Valued Customer'},</p>
          
          <p>Good news! Your order #${order.order_number} has been shipped and is on its way to you.</p>
          
          <div class="shipping-info">
            <h3>Shipping Information</h3>
            <p><strong>Carrier:</strong> ${shipment.carrier || 'Our logistics partner'}</p>
            <p><strong>Shipping Date:</strong> ${shippingDate.toLocaleDateString()}</p>
            <p><strong>Estimated Delivery:</strong> ${estimatedDelivery.toLocaleDateString()}</p>
            ${shipment.tracking_code ? `
              <p><strong>Tracking Number:</strong> <span class="tracking-number">${shipment.tracking_code}</span></p>
              <p style="margin-top: 15px;"><a href="${getCarrierTrackingUrl(shipment.carrier, shipment.tracking_code)}" class="button">Track Your Package</a></p>
            ` : ''}
          </div>
          
          <p>You can also view the status of your order by logging into your account.</p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/orders/${order.id}" class="button">View Order Details</a>
          </p>
        </div>
        
        <div class="footer">
          <p>If you have any questions about your order, please contact our customer support at support@alitools.com</p>
          <p>&copy; ${new Date().getFullYear()} AliTools B2B. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Helper function to get tracking URL for different carriers
 * 
 * @param {string} carrier - Name of the carrier
 * @param {string} trackingNumber - Tracking number
 * @returns {string} - Tracking URL
 */
const getCarrierTrackingUrl = (carrier, trackingNumber) => {
  if (!trackingNumber) return '#';
  
  const carrierUrls = {
    'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'DHL': `https://www.dhl.com/us-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${trackingNumber}`
  };
  
  return carrierUrls[carrier] || '#';
}; 