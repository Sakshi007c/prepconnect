import { supabase } from '../supabaseClient';

export const PREP_PDF_BUCKET = 'prep-material-pdfs';

const sanitizeFileName = (name = 'prep-material.pdf') =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-');

const sanitizeCompanyName = (name = 'company') =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'company';

export const uploadPrepPdf = async ({ file, companyName }) => {
  if (!file) return null;

  const fileName = sanitizeFileName(file.name);
  const companySlug = sanitizeCompanyName(companyName);
  const filePath = `${companySlug}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PREP_PDF_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'application/pdf'
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(PREP_PDF_BUCKET).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    name: file.name,
    path: filePath
  };
};
