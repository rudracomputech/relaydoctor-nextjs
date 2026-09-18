import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import SpecialityCategory from "@/models/SpecialityCategory"
import SpecialitySubcategory from "@/models/SpecialitySubcategory"

import { Header } from '@/components/header'
import { Main } from '@/components/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Stethoscope } from "lucide-react"
import { SpecialitiesClient } from "./components/specialities-client"

export default async function SpecialitiesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/sign-in')
  }

  await connectToDatabase()

  // Seed default categories and subcategories if database is completely empty
  const categoryCount = await SpecialityCategory.countDocuments()
  if (categoryCount === 0) {
    const defaultData = [
      {
        name: 'Cardiology',
        description: 'Heart and cardiovascular system care and treatments',
        icon: 'Heart',
        displayOrder: 1,
        subcategories: [
          'Interventional Cardiology',
          'Electrophysiology',
          'Pediatric Cardiology',
          'Heart Failure & Transplant',
        ],
      },
      {
        name: 'Neurology',
        description: 'Brain, spinal cord, and nervous system disorders',
        icon: 'Brain',
        displayOrder: 2,
        subcategories: ['Stroke Specialist', 'Epilepsy & Seizures', 'Neuro-oncology', 'Movement Disorders'],
      },
      {
        name: 'Orthopedics',
        description: 'Bones, joints, ligaments, tendons, and muscles',
        icon: 'Bone',
        displayOrder: 3,
        subcategories: ['Joint Replacement', 'Spine Surgery', 'Sports Medicine', 'Pediatric Orthopedics'],
      },
      {
        name: 'Pediatrics',
        description: 'Medical care of infants, children, and adolescents',
        icon: 'Baby',
        displayOrder: 4,
        subcategories: ['Neonatology', 'Pediatric Pulmonology', 'Pediatric Allergy', 'Adolescent Medicine'],
      },
      {
        name: 'Dermatology',
        description: 'Skin, hair, and nail diagnosis and therapy',
        icon: 'Sparkles',
        displayOrder: 5,
        subcategories: ['Cosmetic Dermatology', 'Dermatopathology', 'Pediatric Dermatology', 'Trichology'],
      },
      {
        name: 'General Medicine',
        description: 'Primary care and non-surgical adult medical treatment',
        icon: 'Stethoscope',
        displayOrder: 6,
        subcategories: ['Internal Medicine', 'Family Practice', 'Diabetology', 'Infectious Disease'],
      },
    ]

    for (const item of defaultData) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const cat = await SpecialityCategory.create({
        name: item.name,
        slug,
        description: item.description,
        icon: item.icon,
        displayOrder: item.displayOrder,
        isActive: true,
      })

      for (const subName of item.subcategories) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        await SpecialitySubcategory.create({
          name: subName,
          slug: subSlug,
          categoryId: cat._id,
          description: `${subName} under ${item.name}`,
          icon: 'Stethoscope',
          isActive: true,
        })
      }
    }
  }

  const rawCategories = await SpecialityCategory.find().sort({ displayOrder: 1, name: 1 }).lean()
  const rawSubcategories = await SpecialitySubcategory.find()
    .populate('categoryId', 'name slug')
    .sort({ displayOrder: 1, name: 1 })
    .lean()

  const subcategoryCounts = await SpecialitySubcategory.aggregate([
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ])

  const countMap: Record<string, number> = {}
  subcategoryCounts.forEach((sc: any) => {
    countMap[sc._id.toString()] = sc.count
  })

  const categories = rawCategories.map((c: any) => ({
    ...c,
    _id: c._id.toString(),
    subcategoriesCount: countMap[c._id.toString()] || 0,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : '',
  }))

  const subcategories = rawSubcategories.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
    category: s.categoryId,
    categoryId: s.categoryId?._id ? s.categoryId._id.toString() : s.categoryId?.toString(),
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
  }))

  return (
    <>
      <Header>
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-5 w-5 text-teal-600" />
          <h2 className='text-lg font-semibold tracking-tight'>Specialities & Taxonomy</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Medical Specialities Management</h1>
          <p className='text-muted-foreground text-sm'>
            Manage categories and super-speciality subcategories for doctor profiling, discovery, and patient referrals.
          </p>
        </div>

        <SpecialitiesClient initialCategories={categories} initialSubcategories={subcategories} />
      </Main>
    </>
  )
}
