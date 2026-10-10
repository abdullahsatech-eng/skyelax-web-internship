import type { AppData } from '../types';

/**
 * Fictional demonstration data. Every client, project and amount below is made up.
 * A function (not a constant) so each caller gets fresh objects that nothing else can mutate.
 */
export function createDemoData(): AppData {
  return {
    projects: [
      {
        id: 'prj_demo_harbor',
        name: 'Harbor & Pine Bakery Website',
        clientName: 'Harbor & Pine Bakery',
        description: 'Five-page marketing site with an online menu and a catering enquiry form.',
        currency: 'USD',
        originalBudget: 8500,
        originalEndDate: '2026-11-20',
        status: 'active',
        createdAt: '2026-08-12T09:00:00.000Z',
        scopeItems: [
          { id: 'sc_demo_h1', title: 'Homepage and brand layout', description: 'Hero, opening hours, featured products and footer.' },
          { id: 'sc_demo_h2', title: 'Menu page', description: 'Menu grouped by category with allergen labels.' },
          { id: 'sc_demo_h3', title: 'Catering enquiry form', description: 'Form with date, headcount and message. Submissions go to one email address.' },
          { id: 'sc_demo_h4', title: 'Contact page', description: 'Address, embedded map and opening hours.' },
          { id: 'sc_demo_h5', title: 'Basic SEO set-up', description: 'Page titles, descriptions and a sitemap file.' },
        ],
      },
      {
        id: 'prj_demo_lumen',
        name: 'Lumen Dental Booking Site',
        clientName: 'Lumen Dental Studio',
        description: 'Service pages and an appointment request form for a three-dentist practice.',
        currency: 'USD',
        originalBudget: 14000,
        originalEndDate: '2026-12-18',
        status: 'active',
        createdAt: '2026-08-25T10:30:00.000Z',
        scopeItems: [
          { id: 'sc_demo_l1', title: 'Service pages', description: 'Seven service pages built from one template.' },
          { id: 'sc_demo_l2', title: 'Appointment request form', description: 'Collects preferred day and time. The front desk confirms by phone.' },
          { id: 'sc_demo_l3', title: 'Staff profiles', description: 'Three profiles with photo, qualifications and a short biography.' },
          { id: 'sc_demo_l4', title: 'Patient FAQ', description: 'Twelve questions in an accessible accordion.' },
        ],
      },
      {
        id: 'prj_demo_atlas',
        name: 'Atlas Freight Shipment Tracker',
        clientName: 'Atlas Freight Co.',
        description: 'A customer-facing view of shipment status with filters and a delivery timeline.',
        currency: 'EUR',
        originalBudget: 22500,
        originalEndDate: '2027-01-29',
        status: 'active',
        createdAt: '2026-09-01T08:15:00.000Z',
        scopeItems: [
          { id: 'sc_demo_a1', title: 'Shipment list', description: 'Sortable list with reference, destination and status.' },
          { id: 'sc_demo_a2', title: 'Shipment detail timeline', description: 'Step-by-step delivery history for a single shipment.' },
          { id: 'sc_demo_a3', title: 'Status filters', description: 'Filter the list by in transit, delayed and delivered.' },
          { id: 'sc_demo_a4', title: 'Handover documentation', description: 'Short guide covering structure and deployment.' },
        ],
      },
      {
        id: 'prj_demo_novus',
        name: 'Novus Academy Course Catalogue',
        clientName: 'Novus Academy',
        description: 'A searchable catalogue of evening courses for a training institute.',
        currency: 'PKR',
        originalBudget: 450000,
        originalEndDate: '2026-12-05',
        status: 'planning',
        createdAt: '2026-09-15T12:00:00.000Z',
        scopeItems: [
          { id: 'sc_demo_n1', title: 'Course listing page', description: 'Grid of courses with duration and fee.' },
          { id: 'sc_demo_n2', title: 'Course detail template', description: 'Syllabus, schedule and enquiry button.' },
          { id: 'sc_demo_n3', title: 'Search and category filters', description: 'Find courses by keyword or category.' },
        ],
      },
      {
        id: 'prj_demo_orchard',
        name: 'Orchard Studio Portfolio Refresh',
        clientName: 'Orchard Studio',
        description: 'Gallery redesign and performance tune-up for a photography studio.',
        currency: 'USD',
        originalBudget: 5200,
        originalEndDate: '2026-09-30',
        status: 'completed',
        createdAt: '2026-07-20T14:00:00.000Z',
        scopeItems: [
          { id: 'sc_demo_o1', title: 'Gallery redesign', description: 'New responsive gallery with lazy-loaded images.' },
          { id: 'sc_demo_o2', title: 'Performance tune-up', description: 'Image compression and caching headers.' },
        ],
      },
    ],
    changeRequests: [
      {
        id: 'cr_demo_01', projectId: 'prj_demo_harbor', title: 'Add online pre-orders for seasonal boxes',
        description: 'The client wants visitors to reserve holiday boxes on the site. Needs a product list, a pre-order form and a confirmation page.',
        costAdjustment: 1200, scheduleImpactDays: 6, status: 'pending_review',
        createdAt: '2026-09-22T09:30:00.000Z', updatedAt: '2026-09-23T11:00:00.000Z',
      },
      {
        id: 'cr_demo_02', projectId: 'prj_demo_harbor', title: 'Show latest Instagram photos on the homepage',
        description: 'Embed a read-only grid of the six most recent posts below the hero section.',
        costAdjustment: 350, scheduleImpactDays: 2, status: 'approved',
        createdAt: '2026-09-10T13:00:00.000Z', updatedAt: '2026-09-12T08:20:00.000Z',
      },
      {
        id: 'cr_demo_03', projectId: 'prj_demo_harbor', title: 'Add pages for a second shop location',
        description: 'A new location opens in spring. Needs its own contact page, hours and menu notes.',
        costAdjustment: 900, scheduleImpactDays: 4, status: 'draft',
        createdAt: '2026-10-02T10:10:00.000Z', updatedAt: '2026-10-02T10:10:00.000Z',
      },
      {
        id: 'cr_demo_04', projectId: 'prj_demo_lumen', title: 'Translate service pages into Spanish',
        description: 'Provide a language switcher and Spanish versions of all seven service pages. The client supplies the translated text.',
        costAdjustment: 2400, scheduleImpactDays: 9, status: 'pending_review',
        createdAt: '2026-09-28T15:45:00.000Z', updatedAt: '2026-09-29T09:00:00.000Z',
      },
      {
        id: 'cr_demo_05', projectId: 'prj_demo_lumen', title: 'Add a patient testimonial carousel',
        description: 'Rotating quotes on the homepage with a moderation step for new testimonials.',
        costAdjustment: 600, scheduleImpactDays: 3, status: 'rejected',
        createdAt: '2026-09-05T11:00:00.000Z', updatedAt: '2026-09-07T16:30:00.000Z',
      },
      {
        id: 'cr_demo_06', projectId: 'prj_demo_lumen', title: 'Offer new-patient forms as downloadable PDFs',
        description: 'Link three intake forms from the appointment page. The practice supplies the PDF files.',
        costAdjustment: 780, scheduleImpactDays: 3, status: 'approved',
        createdAt: '2026-09-18T09:15:00.000Z', updatedAt: '2026-09-19T10:00:00.000Z',
      },
      {
        id: 'cr_demo_07', projectId: 'prj_demo_lumen', title: 'Rework the navigation after stakeholder review',
        description: 'Reorganise the main menu into four groups. No new pages, but every page header needs retesting.',
        costAdjustment: 0, scheduleImpactDays: 2, status: 'pending_review',
        createdAt: '2026-10-04T14:20:00.000Z', updatedAt: '2026-10-04T14:20:00.000Z',
      },
      {
        id: 'cr_demo_08', projectId: 'prj_demo_atlas', title: 'Add CSV export for the shipment list',
        description: 'A button that downloads the currently filtered list as a CSV file.',
        costAdjustment: 1800, scheduleImpactDays: 5, status: 'approved',
        createdAt: '2026-09-14T08:00:00.000Z', updatedAt: '2026-09-16T12:00:00.000Z',
      },
      {
        id: 'cr_demo_09', projectId: 'prj_demo_atlas', title: 'Add a dark colour theme',
        description: 'A theme switch that remembers the visitor\'s choice. All components need contrast checks in both themes.',
        costAdjustment: 1100, scheduleImpactDays: 4, status: 'draft',
        createdAt: '2026-10-05T09:40:00.000Z', updatedAt: '2026-10-05T09:40:00.000Z',
      },
      {
        id: 'cr_demo_10', projectId: 'prj_demo_atlas', title: 'Show shipments on a live carrier map',
        description: 'An interactive map view of in-transit shipments. Depends on the carrier providing a location feed.',
        costAdjustment: 4200, scheduleImpactDays: 14, status: 'pending_review',
        createdAt: '2026-10-01T16:00:00.000Z', updatedAt: '2026-10-03T09:30:00.000Z',
      },
      {
        id: 'cr_demo_11', projectId: 'prj_demo_orchard', title: 'Add print-friendly project sheets',
        description: 'A print stylesheet so each gallery page prints cleanly on A4.',
        costAdjustment: 250, scheduleImpactDays: 1, status: 'approved',
        createdAt: '2026-08-20T10:00:00.000Z', updatedAt: '2026-08-21T10:00:00.000Z',
      },
    ],
  };
}
