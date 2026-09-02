import { z } from "zod"
import { id, is } from "zod/v4/locales"

export const propertySchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(1, "Location is required"),
 
  
  
  
  
  description: z.string().min(3, "Description must be at least 3 characters"),
  room_size: z.string().min(3, "Description must be at least 3 characters"),
 
 
  contact_person: z.string().min(3, "contact_person must be at least 3 characters"),
  contact_number: z.string().min(3, "contact_number must be at least 3 characters"),
  whats_app_number: z.string().min(10, "contact_number must be at least 10 characters"),
  distance_from_mahakal: z.string().min(1, "contact_number must be at least 1 characters"),
}).passthrough()

export type PropertyFormValues = z.infer<typeof propertySchema>

export const cabSchema =  z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    location: z.string().min(1, "Location is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    type: z.array(z.string()).min(1, "Please select at least one type").default([]),
    description: z.string().min(3, "Description must be at least 3 characters"),
    contact_person: z.string().min(3, "contact_person must be at least 3 characters"),
    contact_number: z.string().min(3, "contact_number must be at least 3 characters"),
    whats_app_number: z.string().min(10, "contact_number must be at least 10 characters"),
  }).passthrough()


export type CabFormValues = z.infer<typeof cabSchema>


export const  foodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    location: z.string().min(1, "Location is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    type: z.array(z.string()).min(1, "Please select at least one type").default([]),
    description: z.string().min(3, "Description must be at least 3 characters"),
    contact_person: z.string().min(3, "contact_person must be at least 3 characters"),
    contact_number: z.string().min(3, "contact_number must be at least 3 characters"),
    whats_app_number: z.string().min(10, "contact_number must be at least 10 characters"),
  }).passthrough()


export type FoodFormValues = z.infer<typeof foodSchema>

export const otherSchema = z.object({

    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    contact_person: z.string().min(3, "contact_person must be at least 3 characters"),
    contact_number: z.string().min(3, "contact_number must be at least 3 characters"),
    whats_app_number: z.string().min(10, "contact_number must be at least 10 characters"),
  }).passthrough()


export type OtherFormValues = z.infer<typeof otherSchema>



export const myfieldSchema = z
  .object({
    id: z.number().optional(),

    name: z.string().min(3),

    label: z.string().min(3),

    module: z.string().min(3),

    type: z.enum([
      "text",
      "number",
      "textarea",
      "date",
      "select",
      "multiselect",
      "checkbox",
      "radio",
      "file",
      "color",
      "email",
      "url",
      "password",
      "hidden",
      "readonly",
      "richtext",
    ]),

    options: z.string().default(""),

    is_required: z.coerce.number().default(0),

    note: z.string().optional(),
    status: z.coerce.number().default(1),
  })

  .superRefine((data, ctx) => {

    const needsOptions =
      data.type === "select" ||
      data.type === "multiselect"

    if (needsOptions && !data.options.trim()) {

      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options are required",
      })
    }
  })


export type MyFieldFormValues = z.infer<typeof myfieldSchema>