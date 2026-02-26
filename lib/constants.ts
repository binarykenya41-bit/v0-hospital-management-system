export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
  'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot'
] as const

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const PATIENT_TYPES = ['outpatient', 'inpatient', 'emergency'] as const

export const APPOINTMENT_TYPES = [
  'General Consultation', 'Specialist Clinic', 'Follow-Up',
  'Referral Clinic', 'Emergency', 'Pre-Admission', 'Post-Discharge'
] as const

export const APPOINTMENT_STATUSES = [
  'scheduled', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'
] as const

export const CLINICS = [
  'General Outpatient', 'Medical Outpatient', 'Surgical Outpatient',
  'Pediatrics', 'Obstetrics & Gynecology', 'Orthopedics',
  'ENT', 'Ophthalmology', 'Dermatology', 'Dental',
  'Psychiatry', 'Cardiology', 'Neurology', 'Oncology',
  'Renal', 'Diabetic Clinic', 'TB Clinic', 'HIV/CCC'
] as const

export const LAB_CATEGORIES = [
  'Hematology', 'Biochemistry', 'Microbiology', 'Parasitology',
  'Serology', 'Urinalysis', 'Histopathology', 'Cytology',
  'Blood Bank', 'Immunology'
] as const

export const BILLING_TYPES = ['Cash', 'SHA', 'Insurance', 'Private', 'Corporate'] as const

export const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Bank Transfer', 'Cheque', 'Card', 'SHA'] as const

export const DEPARTMENTS = [
  'Administration', 'Internal Medicine', 'Surgery', 'Pediatrics',
  'Obstetrics & Gynecology', 'Orthopedics', 'ENT', 'Ophthalmology',
  'Dermatology', 'Dental', 'Psychiatry', 'Emergency', 'ICU',
  'Radiology', 'Pharmacy', 'Laboratory', 'Reception', 'Finance',
  'Medical Records', 'Nursing', 'Medical Ward', 'Surgical Ward',
  'Maternity Ward', 'Pediatric Ward', 'Renal Unit', 'Oncology'
] as const

export const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night', 'On-Call'] as const

export const WARDS = [
  'Medical Ward A', 'Medical Ward B', 'Surgical Ward A', 'Surgical Ward B',
  'Maternity Ward', 'Pediatric Ward', 'ICU', 'HDU', 'Burns Unit',
  'Renal Unit', 'Oncology Ward', 'Private Wing', 'Amenity Ward',
  'Emergency Ward', 'Isolation Ward'
] as const
