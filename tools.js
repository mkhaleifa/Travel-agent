// tools.js
// Two things live here:
//   1. TOOL DEFINITIONS  — the JSON schemas the AI reads to know what tools exist
//   2. TOOL FUNCTIONS    — the real JavaScript that runs when the AI calls a tool
// ─────────────────────────────────────────────────────────────────────────────


// ─── SECTION 1: Tool definitions (what the AI sees) ──────────────────────────
// The AI reads the "description" of each tool and parameter to decide:
//   - Does this tool help with my current task?
//   - What arguments should I pass?
// Write descriptions as if explaining to a smart colleague.

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "Get the current weather for any city. " +
        "Use this before recommending travel plans or packing advice.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name, e.g. Cairo, London, New York",
          },
        },
        required: ["city"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "search_flights",
      description:
        "Search for available flights between two cities on a specific date. " +
        "Returns a list of flights with times and prices.",
      parameters: {
        type: "object",
        properties: {
          from: {
            type: "string",
            description: "Departure city name",
          },
          to: {
            type: "string",
            description: "Destination city name",
          },
          date: {
            type: "string",
            description: "Travel date in YYYY-MM-DD format",
          },
        },
        required: ["from", "to", "date"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "search_hotels",
      description:
        "Search for available hotels in a city between two dates. " +
        "Returns hotels with prices per night. " +
        "Always search before booking to show options to the user.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city to search hotels in",
          },
          checkin: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format",
          },
          checkout: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format",
          },
          max_price: {
            type: "number",
            description: "Maximum price per night in USD (optional)",
          },
        },
        required: ["city", "checkin", "checkout"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "book_hotel",
      description:
        "Book a specific hotel room. " +
        "IMPORTANT: Only call this after the user has confirmed they want to proceed. " +
        "Always search_hotels first and present options before booking.",
      parameters: {
        type: "object",
        properties: {
          hotel_name: {
            type: "string",
            description: "Exact name of the hotel to book",
          },
          city: {
            type: "string",
            description: "City where the hotel is located",
          },
          checkin: {
            type: "string",
            description: "Check-in date in YYYY-MM-DD format",
          },
          checkout: {
            type: "string",
            description: "Check-out date in YYYY-MM-DD format",
          },
          guest_name: {
            type: "string",
            description: "Full name of the guest",
          },
        },
        required: ["hotel_name", "city", "checkin", "checkout", "guest_name"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "send_confirmation_email",
      description:
        "Send a booking confirmation email to the user. " +
        "Call this after a successful hotel or flight booking.",
      parameters: {
        type: "object",
        properties: {
          to_email: {
            type: "string",
            description: "Recipient's email address",
          },
          subject: {
            type: "string",
            description: "Email subject line",
          },
          body: {
            type: "string",
            description: "Full email body with booking details",
          },
        },
        required: ["to_email", "subject", "body"],
      },
    },
  },
]


// ─── SECTION 2: Tool functions (what actually runs) ───────────────────────────
// These are the real JavaScript functions.
// In a production app, these would call real APIs (OpenWeatherMap, Amadeus, etc.)
// For this learning project, they return realistic fake data.

export const toolFunctions = {

  // ── get_weather ─────────────────────────────────────────────────────────────
  async get_weather({ city }) {
    console.log(`    [tool] get_weather("${city}")`)

    // Fake weather database — in production: call openweathermap.org API
    const weatherData = {
      Cairo:     { temp: 38, feels_like: 41, condition: "Sunny",       humidity: 25, rain_chance: "10%", advice: "Light clothes, sunscreen essential" },
      London:    { temp: 14, feels_like: 11, condition: "Cloudy",      humidity: 80, rain_chance: "70%", advice: "Bring a raincoat and umbrella" },
      "New York":{ temp: 22, feels_like: 22, condition: "Partly Cloudy", humidity: 55, rain_chance: "20%", advice: "Light jacket recommended for evening" },
      Dubai:     { temp: 42, feels_like: 45, condition: "Hot & Sunny",  humidity: 60, rain_chance: "5%",  advice: "Stay hydrated, avoid midday sun" },
      Paris:     { temp: 18, feels_like: 17, condition: "Light Rain",   humidity: 75, rain_chance: "60%", advice: "Umbrella needed, light layers" },
      Tokyo:     { temp: 26, feels_like: 28, condition: "Humid",        humidity: 85, rain_chance: "35%", advice: "Light breathable clothes" },
    }

    const weather = weatherData[city] || {
      temp: 20, feels_like: 20, condition: "Unknown",
      humidity: 50, rain_chance: "N/A", advice: "Check local forecast"
    }

    return { city, ...weather, unit: "Celsius" }
  },


  // ── search_flights ───────────────────────────────────────────────────────────
  async search_flights({ from, to, date }) {
    console.log(`    [tool] search_flights("${from}" → "${to}" on ${date})`)

    // Fake flight data — in production: call Amadeus or Skyscanner API
    return {
      from, to, date,
      flights: [
        {
          flight_number: "MS704",
          airline:       "EgyptAir",
          departure:     "08:00",
          arrival:       "12:30",
          duration:      "4h 30m",
          price_usd:     320,
          seats_left:    8,
          class:         "Economy",
        },
        {
          flight_number: "EK851",
          airline:       "Emirates",
          departure:     "14:00",
          arrival:       "18:45",
          duration:      "4h 45m",
          price_usd:     410,
          seats_left:    3,
          class:         "Economy",
        },
        {
          flight_number: "BA107",
          airline:       "British Airways",
          departure:     "21:30",
          arrival:       "02:00+1",
          duration:      "4h 30m",
          price_usd:     580,
          seats_left:    12,
          class:         "Business",
        },
      ],
    }
  },


  // ── search_hotels ────────────────────────────────────────────────────────────
  async search_hotels({ city, checkin, checkout, max_price }) {
    console.log(`    [tool] search_hotels("${city}", ${checkin} → ${checkout}, max: $${max_price || "any"})`)

    // Fake hotel data — in production: call Booking.com or Hotels.com API
    const allHotels = [
      { name: "Grand Nile Tower",     stars: 5, price_per_night: 180, rating: 4.8, amenities: ["Pool", "Spa", "Gym", "River view"] },
      { name: "Kempinski Nile Hotel", stars: 5, price_per_night: 220, rating: 4.9, amenities: ["Pool", "Fine dining", "Butler service"] },
      { name: "Steigenberger Hotel",  stars: 4, price_per_night: 120, rating: 4.5, amenities: ["Gym", "Restaurant", "Free WiFi"] },
      { name: "Cairo Marriott Hotel", stars: 5, price_per_night: 195, rating: 4.7, amenities: ["Pool", "Tennis", "Multiple restaurants"] },
      { name: "Ibis Cairo City",      stars: 3, price_per_night:  65, rating: 4.0, amenities: ["Free WiFi", "24h Reception"] },
    ]

    // Filter by max_price if provided
    const hotels = max_price
      ? allHotels.filter(h => h.price_per_night <= max_price)
      : allHotels

    // Calculate number of nights
    const msPerDay   = 1000 * 60 * 60 * 24
    const nights     = Math.round((new Date(checkout) - new Date(checkin)) / msPerDay)

    return {
      city, checkin, checkout, nights,
      hotels: hotels.map(h => ({
        ...h,
        total_price: h.price_per_night * nights,
        currency:    "USD",
      })),
    }
  },


  // ── book_hotel ───────────────────────────────────────────────────────────────
  async book_hotel({ hotel_name, city, checkin, checkout, guest_name }) {
    console.log(`    [tool] book_hotel("${hotel_name}" for ${guest_name})`)

    // In production: call the hotel's booking API
    // Generate a fake confirmation number
    const confirmationNumber = "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase()
    const msPerDay           = 1000 * 60 * 60 * 24
    const nights             = Math.round((new Date(checkout) - new Date(checkin)) / msPerDay)

    const priceMap = {
      "Grand Nile Tower":     180,
      "Kempinski Nile Hotel": 220,
      "Steigenberger Hotel":  120,
      "Cairo Marriott Hotel": 195,
      "Ibis Cairo City":       65,
    }
    const pricePerNight = priceMap[hotel_name] || 150
    const totalPrice    = pricePerNight * nights

    return {
      success:             true,
      confirmation_number: confirmationNumber,
      hotel_name,
      city,
      guest_name,
      checkin,
      checkout,
      nights,
      price_per_night:     pricePerNight,
      total_price:         totalPrice,
      currency:            "USD",
      status:              "Confirmed",
    }
  },


  // ── send_confirmation_email ──────────────────────────────────────────────────
  async send_confirmation_email({ to_email, subject, body }) {
    console.log(`    [tool] send_confirmation_email(to: ${to_email})`)

    // In production: use Nodemailer, SendGrid, or Resend
    // For demo: just log it
    console.log(`\n    ✉️  Email sent!`)
    console.log(`    To:      ${to_email}`)
    console.log(`    Subject: ${subject}`)
    console.log(`    Body:\n${body.split("\n").map(l => "      " + l).join("\n")}`)

    return {
      success:    true,
      message_id: "msg_" + Math.random().toString(36).slice(2, 10),
      to:         to_email,
      sent_at:    new Date().toISOString(),
    }
  },
}