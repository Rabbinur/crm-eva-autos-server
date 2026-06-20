class Templates {
  private wrapper(content: string, title: string) {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <div style="background-color: #ff6600; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #fff;">🍽️ kamrul's</h2>
            <p style="color: #fff; margin-top: 5px;">${title}</p>
          </div>

          <div style="padding: 20px;">
            ${content}
          </div>

          <div style="background-color: #f1f1f1; text-align: center; padding: 12px; font-size: 12px; color: #777;">
            <p>&copy; ${new Date().getFullYear()} kamrul's</p>
          </div>
        </div>
      </div>
    `;
  }

  private renderCore(data: any) {
    const {
      customer_name,
      order_type,
      status,
      total_amount,
      payment_status,
      delivery_date,
      reservation_date,
      event_date,
      starting_time,
      event_location,
      event_type,
      delivery_time,
      reservation_time,
      guests,
      tracking_url,
    } = data;

    let info = "";

    switch (order_type) {
      case "delivery":
        info += `
          <p><strong>Delivery Date:</strong> ${new Date(delivery_date).toLocaleDateString()} at ${delivery_time}</p>
        `;
        break;
      case "takeaway":
        break;
      case "reservation":
        info += `
          <p><strong>Reservation Date:</strong> ${new Date(reservation_date).toLocaleDateString()} at ${reservation_time}</p>
          <p><strong>Guests:</strong> ${guests}</p>
        `;
        break;
      case "catering":
        info += `
          <p><strong>Event Date:</strong> ${new Date(event_date).toLocaleDateString()} at ${starting_time}</p>
          ${event_type ? `<p><strong>Event type:</strong> ${event_type}</p>` : ""}
          ${event_location ? `<p><strong>Location:</strong> ${event_location}</p>` : ""}
        `;
        break;
    }

    return `
      <p>Hi <strong>${customer_name}</strong>,</p>
      <p>Your ${order_type} order is now <strong>${status.toUpperCase()}</strong>.</p>
      ${info}
     ${total_amount != null && total_amount > 0 ? `<p><strong>Total:</strong> $${total_amount.toFixed(2)}</p>` : ""}

      ${payment_status ? `<p><strong>Payment:</strong> ${payment_status.toUpperCase()}</p>` : ""}

      ${
        tracking_url
          ? `
        <div style="margin-top: 20px; text-align: center;">
          <a href="${tracking_url}" style="background-color: #ff6600; color: white; padding: 10px 16px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Your Order
          </a>
        </div>
      `
          : ""
      }

      <p style="margin-top: 30px;">Thank you for choosing kamrul's!</p>
    `;
  }

  generate(data: {
    customer_name: string;
    order_type: "delivery" | "takeaway" | "reservation" | "catering";
    status: string;
    total_amount?: number;
    payment_status?: string;
    delivery_date?: string;
    pickup_date?: string;
    reservation_date?: string;
    event_date?: string;
    event_location?: string;
    event_type?: string;
    starting_time?: string;
    delivery_time?: string;
    pickup_time?: string;
    reservation_time?: string;
    guests?: number;
    tracking_url?: string;
  }) {
    const title = `${data.order_type[0].toUpperCase() + data.order_type.slice(1)} Order ${data.status[0].toUpperCase() + data.status.slice(1)}`;
    return this.wrapper(this.renderCore(data), title);
  }
}

export const OrderEmailTemplates = new Templates();
