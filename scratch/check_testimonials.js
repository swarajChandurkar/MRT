import prisma from '../server/db.js';

async function check() {
  try {
    const t = await prisma.testimonial.findMany();
    console.log('Testimonials found:', t.length);
    if (t.length > 0) {
      console.log('Sample:', t[0]);
    }
  } catch (err) {
    console.error('Error fetching testimonials:', err);
  } finally {
    process.exit();
  }
}

check();
