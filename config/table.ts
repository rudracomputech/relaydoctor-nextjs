import { z } from "zod";

export const TableConfig = {
  // Define your table configuration here
  properties: {
    columns: [
      { id: "title", label: "Title" },
      { id: "room_size", label: "Room Size (sq ft)" },
      { id: "price", label: "Price" },
      { id: "price_type", label: "Price Type" },
      { id: "type", label: "Type" },
      { id: "rating", label: "Rating" },
  
    ],
    schema: z.object({
      id: z.number(),
      title: z.string(),
      location: z.string(),
      rating: z.number(),
    }),
    fields: [
      {name: "id", label: "ID", type: "hidden",sort_order: 0},
      { name: "title", label: "Name", type: "text" , sort_order: 1 },
   
    
      { name: "room_size", label: "Room Size (sq ft)", type: "text" , sort_order: 3 },
{name: "room_pricing", label: "Room Pricing", type: "room_pricing" , sort_order: 5 },

      { name: "person_per_room", label: "Allowed Person / Room", type: "number" , sort_order: 4 },

      

      { name: "contact_person", label: "Contact Person", type: "text" , sort_order: 6 },
      { name: "contact_number", label: "Contact Number", type: "text" , sort_order: 7 },
      { name: "whats_app_number", label: "WhatsApp Number", type: "text" , sort_order: 8 },
      {
        name: "distance_from_mahakal",
        label: "Distance from Mahakal (km)",
        type: "number",
        sort_order: 9
      },
{ name: "location", label: "Location", type: "textarea" , sort_order: 14 },

       { name: "description", label: "Description", type: "richtext" , sort_order: 15, max_length: 10000 },
       { name: "main_image", label: "Main Image", type: "file" , sort_order: 100 },
       { name: "gallery", label: "Gallery", type: "gallery" , sort_order: 110 },
    ],
  },
  cabs: {
    columns: [
      { id: "driverName", label: "Driver Name" },
      { id: "carModel", label: "Car Model" },
      { id: "licensePlate", label: "License Plate" },
    ],
    schema: z.object({
      driverName: z.string(),
      carModel: z.string(),
      licensePlate: z.string(),
    }),
    fields: [
      { name: "driverName", label: "Driver Name", type: "text" },
      { name: "carModel", label: "Car Model", type: "text" },
      { name: "licensePlate", label: "License Plate", type: "text" },
      { name: "contactNumber", label: "Contact Number", type: "text" },
      { name: "availability", label: "Availability", type: "select", options: [
        { label: "Available", value: 'available' },
        { label: "Not Available", value: 'not_available' }
      ] },
      { name: "pricePerKm", label: "Price per Km (INR)", type: "number" },
      { name: "carType", label: "Car Type", type: "select", options: [
        { label: "Sedan", value: 'sedan' },
        { label: "SUV", value: 'suv' },
        { label: "Hatchback", value: 'hatchback' }
      ] },
      { name: "driverRating", label: "Driver Rating", type: "number" },
      { name: "carRating", label: "Car Rating", type: "number" },
      { name: "notes", label: "Additional Notes", type: "textarea" },
     
    ],
  },
  foods: {
    columns: [
      { id: "name", label: "Food Name" },
      { id: "cuisine", label: "Cuisine" },
      { id: "price", label: "Price" },
    ],
    schema: z.object({
      name: z.string(),
      cuisine: z.string(),
      price: z.number(),
    }),

    fields: [
      { name: "name", label: "Food Name", type: "text" },
      { name: "cuisine", label: "Cuisine", type: "text" },
      { name: "price", label: "Price (INR)", type: "number" },
      { name: "restaurantName", label: "Restaurant Name", type: "text" },
      { name: "contactNumber", label: "Contact Number", type: "text" },
      { name: "availability", label: "Availability", type: "select", options: [
        { label: "Available", value: 'available' },
        { label: "Not Available", value: 'not_available' }
      ] },
      { name: "rating", label: "Rating", type: "number" },
      { name: "notes", label: "Additional Notes", type: "textarea" },
      { name: "spiceLevel", label: "Spice Level", type: "select", options: [
        { label: "Mild", value: 'mild' },
        { label: "Medium", value: 'medium' },
        { label: "Hot", value: 'hot' }
      ] },
      { name: "foodType", label: "Food Type", type: "select", options: [
        { label: "Vegetarian", value: 'vegetarian' },
        { label: "Non-Vegetarian", value: 'non_vegetarian' },
        { label: "Vegan", value: 'vegan' }
      ] },
      { name: "cuisineType", label: "Cuisine Type", type: "select", options: [
        { label: "Indian", value: 'indian' },
        { label: "Chinese", value: 'chinese' },
        { label: "Italian", value: 'italian' },
        { label: "Mexican", value: 'mexican' },
        { label: "Continental", value: 'continental' }
      ] },
      { name: "priceType", label: "Price Type", type: "select", options: [
        { label: "Per Plate", value: 'per_plate' },
        { label: "Per Person", value: 'per_person' }
      ] },
      { name: "availableTimings", label: "Available Timings", type: "text" },
      { name: "restaurantAddress", label: "Restaurant Address", type: "textarea" },
      { name: "deliveryOptions", label: "Delivery Options", type: "multiselect", options: [
        { label: "Dine-in", value: 'dine_in' },
        { label: "Takeaway", value: 'takeaway' },
        { label: "Home Delivery", value: 'home_delivery' }
      ] },
      { name: "paymentOptions", label: "Payment Options", type: "multiselect", options: [
        { label: "Cash", value: 'cash' },
        { label: "Credit Card", value: 'credit_card' },
        { label: "Mobile Payment", value: 'mobile_payment' }
      ] },
      { name: "specialOffers", label: "Special Offers", type: "textarea" },
      { name: "customerReviews", label: "Customer Reviews", type: "textarea" },
      { name: "hygieneRating", label: "Hygiene Rating", type: "number" },
      { name: "ambienceRating", label: "Ambience Rating", type: "number" },
      { name: "serviceRating", label: "Service Rating", type: "number" },
      { name: "overallRating", label: "Overall Rating", type: "number" },
      { name: "isVegetarian", label: "Is Vegetarian", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isVegan", label: "Is Vegan", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isGlutenFree", label: "Is Gluten Free", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSpicy", label: "Is Spicy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSweet", label: "Is Sweet", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSour", label: "Is Sour", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isBitter", label: "Is Bitter", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isUmami", label: "Is Umami", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isCrunchy", label: "Is Crunchy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSoft", label: "Is Soft", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isChewy", label: "Is Chewy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isJuicy", label: "Is Juicy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isDry", label: "Is Dry", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isOily", label: "Is Oily", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isHealthy", label: "Is Healthy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isJunkFood", label: "Is Junk Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isOrganic", label: "Is Organic", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isLocallySourced", label: "Is Locally Sourced", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSeasonal", label: "Is Seasonal", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSpecialtyDish", label: "Is Specialty Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isChefSpecial", label: "Is Chef Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSignatureDish", label: "Is Signature Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isPopularDish", label: "Is Popular Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isRecommendedDish", label: "Is Recommended Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isBestSeller", label: "Is Best Seller", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isNewDish", label: "Is New Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isSeasonalSpecial", label: "Is Seasonal Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isLimitedEdition", label: "Is Limited Edition", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isExclusiveDish", label: "Is Exclusive Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isGourmetDish", label: "Is Gourmet Dish", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isFineDining", label: "Is Fine Dining", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }
      ] },
      { name: "isCasualDining", label: "Is Casual Dining", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isStreetFood", label: "Is Street Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCafe", label: "Is Cafe", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBakery", label: "Is Bakery", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessert", label: "Is Dessert", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverage", label: "Is Beverage", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnack", label: "Is Snack", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAppetizer", label: "Is Appetizer", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isMainCourse", label: "Is Main Course", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessertCourse", label: "Is Dessert Course", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverageCourse", label: "Is Beverage Course", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnackCourse", label: "Is Snack Course", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfast", label: "Is Breakfast", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunch", label: "Is Lunch", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinner", label: "Is Dinner", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNight", label: "Is Late Night", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDay", label: "Is All Day", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialOccasion", label: "Is Special Occasion", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFestiveSpecial", label: "Is Festive Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalSpecial", label: "Is Seasonal Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLimitedTimeOffer", label: "Is Limited Time Offer", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isComboOffer", label: "Is Combo Offer", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDiscounted", label: "Is Discounted", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialDeal", label: "Is Special Deal", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHappyHour", label: "Is Happy Hour", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekendSpecial", label: "Is Weekend Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekdaySpecial", label: "Is Weekday Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunchSpecial", label: "Is Lunch Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinnerSpecial", label: "Is Dinner Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfastSpecial", label: "Is Breakfast Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNightSpecial", label: "Is Late Night Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDaySpecial", label: "Is All Day Special", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialMenu", label: "Is Special Menu", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChefRecommendation", label: "Is Chef Recommendation", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCustomerFavorite", label: "Is Customer Favorite", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHighlyRated", label: "Is Highly Rated", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAwardWinning", label: "Is Award Winning", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isInstagrammable", label: "Is Instagrammable", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFoodPorn", label: "Is Food Porn", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ]
       },
      { name: "isComfortFood", label: "Is Comfort Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isGuiltyPleasure", label: "Is Guilty Pleasure", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHealthyOption", label: "Is Healthy Option", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isIndulgent", label: "Is Indulgent", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDecadent", label: "Is Decadent", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isRich", label: "Is Rich", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCreamy", label: "Is Creamy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCheesy", label: "Is Cheesy", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpicyFood", label: "Is Spicy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSweetFood", label: "Is Sweet Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSourFood", label: "Is Sour Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBitterFood", label: "Is Bitter Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isUmamiFood", label: "Is Umami Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCrunchyFood", label: "Is Crunchy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSoftFood", label: "Is Soft Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChewyFood", label: "Is Chewy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isJuicyFood", label: "Is Juicy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDryFood", label: "Is Dry Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isOilyFood", label: "Is Oily Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHealthyFood", label: "Is Healthy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isJunkFood", label: "Is Junk Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isOrganicFood", label: "Is Organic Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLocallySourcedFood", label: "Is Locally Sourced Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalFood", label: "Is Seasonal Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialtyFood", label: "Is Specialty Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChefSpecialFood", label: "Is Chef Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSignatureFood", label: "Is Signature Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isPopularFood", label: "Is Popular Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isRecommendedFood", label: "Is Recommended Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBestSellerFood", label: "Is Best Seller Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isNewFood", label: "Is New Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalSpecialFood", label: "Is Seasonal Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLimitedEditionFood", label: "Is Limited Edition Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isExclusiveFood", label: "Is Exclusive Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isGourmetFood", label: "Is Gourmet Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFineDiningFood", label: "Is Fine Dining Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCasualDiningFood", label: "Is Casual Dining Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isStreetFoodFood", label: "Is Street Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCafeFood", label: "Is Cafe Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBakeryFood", label: "Is Bakery Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessertFood", label: "Is Dessert Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverageFood", label: "Is Beverage Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnackFood", label: "Is Snack Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAppetizerFood", label: "Is Appetizer Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isMainCourseFood", label: "Is Main Course Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessertCourseFood", label: "Is Dessert Course Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverageCourseFood", label: "Is Beverage Course Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnackCourseFood", label: "Is Snack Course Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfastFood", label: "Is Breakfast Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunchFood", label: "Is Lunch Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinnerFood", label: "Is Dinner Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNightFood", label: "Is Late Night Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDayFood", label: "Is All Day Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialOccasionFood", label: "Is Special Occasion Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFestiveSpecialFood", label: "Is Festive Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalSpecialFood", label: "Is Seasonal Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLimitedTimeOfferFood", label: "Is Limited Time Offer Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isComboOfferFood", label: "Is Combo Offer Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDiscountedFood", label: "Is Discounted Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialDealFood", label: "Is Special Deal Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHappyHourFood", label: "Is Happy Hour Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekendSpecialFood", label: "Is Weekend Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekdaySpecialFood", label: "Is Weekday Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunchSpecialFood", label: "Is Lunch Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinnerSpecialFood", label: "Is Dinner Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfastSpecialFood", label: "Is Breakfast Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNightSpecialFood", label: "Is Late Night Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDaySpecialFood", label: "Is All Day Special Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialMenuFood", label: "Is Special Menu Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChefRecommendationFood", label: "Is Chef Recommendation Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCustomerFavoriteFood", label: "Is Customer Favorite Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHighlyRatedFood", label: "Is Highly Rated Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAwardWinningFood", label: "Is Award Winning Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isInstagrammableFood", label: "Is Instagrammable Food", type: "select", options: [
        {  label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFoodPornFood", label: "Is Food Porn Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isComfortFoodFood", label: "Is Comfort Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isGuiltyPleasureFood", label: "Is Guilty Pleasure Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
      ] },
      { name: "isHealthyOptionFood", label: "Is Healthy Option Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isIndulgentFood", label: "Is Indulgent Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDecadentFood", label: "Is Decadent Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isRichFood", label: "Is Rich Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCreamyFood", label: "Is Creamy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCheesyFood", label: "Is Cheesy Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpicyFoodFood", label: "Is Spicy Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSweetFoodFood", label: "Is Sweet Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSourFoodFood", label: "Is Sour Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBitterFoodFood", label: "Is Bitter Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isUmamiFoodFood", label: "Is Umami Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCrunchyFoodFood", label: "Is Crunchy Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSoftFoodFood", label: "Is Soft Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChewyFoodFood", label: "Is Chewy Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isJuicyFoodFood", label: "Is Juicy Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDryFoodFood", label: "Is Dry Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isOilyFoodFood", label: "Is Oily Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHealthyFoodFood", label: "Is Healthy Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isJunkFoodFood", label: "Is Junk Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isOrganicFoodFood", label: "Is Organic Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLocallySourcedFoodFood", label: "Is Locally Sourced Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalFoodFood", label: "Is Seasonal Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialtyFoodFood", label: "Is Specialty Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChefSpecialFoodFood", label: "Is Chef Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSignatureFoodFood", label: "Is Signature Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isPopularFoodFood", label: "Is Popular Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isRecommendedFoodFood", label: "Is Recommended Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBestSellerFoodFood", label: "Is Best Seller Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isNewFoodFood", label: "Is New Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalSpecialFoodFood", label: "Is Seasonal Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLimitedEditionFoodFood", label: "Is Limited Edition Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isExclusiveFoodFood", label: "Is Exclusive Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isGourmetFoodFood", label: "Is Gourmet Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },  
      { name: "isFineDiningFoodFood", label: "Is Fine Dining Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCasualDiningFoodFood", label: "Is Casual Dining Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isStreetFoodFoodFood", label: "Is Street Food Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isCafeFoodFood", label: "Is Cafe Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBakeryFoodFood", label: "Is Bakery Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessertFoodFood", label: "Is Dessert Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverageFoodFood", label: "Is Beverage Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnackFoodFood", label: "Is Snack Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAppetizerFoodFood", label: "Is Appetizer Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isMainCourseFoodFood", label: "Is Main Course Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDessertCourseFoodFood", label: "Is Dessert Course Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBeverageCourseFoodFood", label: "Is Beverage Course Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSnackCourseFoodFood", label: "Is Snack Course Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfastFoodFood", label: "Is Breakfast Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunchFoodFood", label: "Is Lunch Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinnerFoodFood", label: "Is Dinner Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNightFoodFood", label: "Is Late Night Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDayFoodFood", label: "Is All Day Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialOccasionFoodFood", label: "Is Special Occasion Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isFestiveSpecialFoodFood", label: "Is Festive Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSeasonalSpecialFoodFood", label: "Is Seasonal Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLimitedTimeOfferFoodFood", label: "Is Limited Time Offer Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isComboOfferFoodFood", label: "Is Combo Offer Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDiscountedFoodFood", label: "Is Discounted Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialDealFoodFood", label: "Is Special Deal Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isHappyHourFoodFood", label: "Is Happy Hour Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekendSpecialFoodFood", label: "Is Weekend Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isWeekdaySpecialFoodFood", label: "Is Weekday Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLunchSpecialFoodFood", label: "Is Lunch Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isDinnerSpecialFoodFood", label: "Is Dinner Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isBreakfastSpecialFoodFood", label: "Is Breakfast Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isLateNightSpecialFoodFood", label: "Is Late Night Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isAllDaySpecialFoodFood", label: "Is All Day Special Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isSpecialMenuFoodFood", label: "Is Special Menu Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },
      { name: "isChefRecommendationFoodFood", label: "Is Chef Recommendation Food Food", type: "select", options: [
        { label: "Yes", value: 'yes' },
        { label: "No", value: 'no' }      ] },

      ],

    },
    others: {
      columns: [
        { id: "name", label: "Name" },
        { id: "description", label: "Description" },
      ],
      schema: z.object({
        name: z.string(),
        description: z.string(),
      }),
      fields: [
        { name: "title", label: "Property Name", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "price", label: "Price", type: "number" },
        { name: "description", label: "Description", type: "text" },
        { name: "room", label: "Room Type", type: "text" },
        {
          name: "amenities",
          label: "Amenities",
          type: "select",
          options: [
            { label: "WiFi", value: "wifi" },
            { label: "Parking", value: "parking" },
          ],
        },
        { name: "contact_number", label: "Contact Number", type: "text" },
        { name: "whats_app_number", label: "WhatsApp Number", type: "text" },
        {
          name: "distance_from_mahakal",
          label: "Distance from Mahakal",
          type: "number",
        },
        {
          name: "bed_type",
          label: "Bed Type",
          type: "select",
          options: [
            { label: "Single", value: "single" },
            { label: "Double", value: "double" },
          ],
        },
        {
          name: "facilities",
          label: "Facilities",
          type: "select",
          options: [
            { label: "WiFi", value: "wifi" },
            { label: "Parking", value: "parking" },
          ],
        },
        { name: "published_at", label: "Published At", type: "datetime" },
        { name: "locale", label: "Locale", type: "text" },
        { name: "contact_person", label: "Contact Person", type: "text" },
        {
          name: "price_type",
          label: "Price Type",
          type: "select",
          options: [
            { label: "Per Night", value: "per_night" },
            { label: "Per Day", value: "per_day" },
          ],
        },
        { name: "room_size", label: "Room Size", type: "text" },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Standard", value: "standard" },
            { label: "Deluxe", value: "deluxe" },
          ],
        },
        { name: "document_id", label: "Document ID", type: "number" },
        { name: "id", label: "ID", type: "number" },
        { name: "created_by_id", label: "Created By", type: "number" },
        { name: "updated_by_id", label: "Updated By", type: "number" },
        { name: "created_at", label: "Created At", type: "datetime" },
        { name: "updated_at", label: "Updated At", type: "datetime" },
        { name: "rating", label: "Rating", type: "number" },
      ],
    },
    myfields: {
      columns: [
        { id: "label", label: "Title" },
        { id: "module", label: "Module" },
        { id: "type", label: "Type" },
        { id: "is_required", label: "Required" },
        { id: "created_at", label: "Created At" },
      ],
      schema: z.object({
        id: z.number().optional(),
        label: z.string(),
        module: z.string(),
        type: z.string(),
        is_required: z.boolean(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
      }),
      fields: [
        { name: "label", label: "Title", type: "text" },
        { name: "module", label: "Module", type: "text" },
        { name: "type", label: "Type", type: "text" },
        { name: "is_required", label: "Required", type: "checkbox" },
        { name: "created_at", label: "Created At", type: "datetime" },
        { name: "updated_at", label: "Updated At", type: "datetime" },
      ],
    },
};
