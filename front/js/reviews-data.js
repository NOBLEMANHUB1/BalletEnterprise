// Seed reviews, keyed by product id — starting values only.
// The live/editable copy lives in localStorage (see js/reviews.js).

const SEED_REVIEWS = {
  1: [
    { id: 1, author: 'Ama K.', rating: 5, comment: "Blends smoothies in seconds and the blades haven't dulled after months of daily use.", date: '2026-05-14' },
    { id: 2, author: 'Kwame O.', rating: 4, comment: 'Solid blender for the price. A bit loud on high speed but gets the job done.', date: '2026-04-02' }
  ],
  2: [
    { id: 1, author: 'Efua T.', rating: 5, comment: 'Heats up food evenly and the preset buttons are genuinely useful.', date: '2026-06-01' }
  ],
  3: [
    { id: 1, author: 'Nana Y.', rating: 5, comment: 'Camera quality is excellent for the price point. Battery easily lasts a full day.', date: '2026-06-10' },
    { id: 2, author: 'Abena S.', rating: 4, comment: 'Great phone overall, though it took a day to get used to the button layout.', date: '2026-05-22' },
    { id: 3, author: 'Kojo M.', rating: 5, comment: 'Fast, smooth, and the display looks great outdoors too.', date: '2026-05-03' }
  ],
  4: [
    { id: 1, author: 'Adjoa B.', rating: 4, comment: 'Good sound isolation for the price. Case could be a little sturdier.', date: '2026-04-18' }
  ],
  5: [
    { id: 1, author: 'Yaw D.', rating: 5, comment: 'Light enough to carry everywhere and handles my daily workload without lag.', date: '2026-06-05' },
    { id: 2, author: 'Akosua P.', rating: 4, comment: 'Great laptop, wish the charger cable was a bit longer.', date: '2026-05-11' }
  ],
  6: [],
  7: [
    { id: 1, author: 'Kofi A.', rating: 5, comment: "Picture quality is fantastic straight out of the box, barely needed to adjust settings.", date: '2026-06-08' }
  ],
  8: [],
  9: []
};