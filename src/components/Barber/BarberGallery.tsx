/**
 * AUTO-FUNCTION-COMMENT: BarberGallery
 * Purpose: Handles barber gallery.
 * Line-by-line:
 * 1. Executes `const images = [`.
 * 2. Executes `"https://lh3.googleusercontent.com/aida-public/AB6AXuDFKQt0yUHI0N2mgcfF6ysODqSylj_nKHwNYDhkwUNXWeRh8gyBPmbnxl-N_R3S7r-gIfCRXp4ZujdBUyPQEd...`.
 * 3. Executes `"https://lh3.googleusercontent.com/aida-public/AB6AXuAWLo_lelvx7MmCJTjOvgdI2A6ukFs7FK598wrI2VvvuOxPANEEGgXawo0DtZiBFiUPBVUcOGKNhXSkDwg3bS...`.
 * 4. Executes `"https://lh3.googleusercontent.com/aida-public/AB6AXuBAG6uROs6EC-3OM7BOyVvN-w4GEh4hV_jLRrcX5a1eyCuozv0EN3TSKCo8FWTrxDM2s06pSjBuv_GtUvYDE9...`.
 * 5. Executes `];`.
 * 6. Executes `return (`.
 * 7. Executes `<div className="grid grid-cols-[2fr_1fr_1fr] gap-1 sm:gap-2 rounded-xl overflow-hidden aspect-[3/2]">`.
 * 8. Executes `<div`.
 * 9. Executes `className="row-span-2 bg-cover bg-center"`.
 * 10. Executes `style={{ backgroundImage: \`url(${images[0]})\` }}`.
 * 11. Executes `/>`.
 * 12. Executes `<div`.
 * 13. Executes `className="col-span-2 bg-cover bg-center"`.
 * 14. Executes `style={{ backgroundImage: \`url(${images[1]})\` }}`.
 * 15. Executes `/>`.
 * 16. Executes `<div`.
 * 17. Executes `className="col-span-2 bg-cover bg-center"`.
 * 18. Executes `style={{ backgroundImage: \`url(${images[2]})\` }}`.
 * 19. Executes `/>`.
 * 20. Executes `</div>`.
 * 21. Executes `);`.
 */
export default function BarberGallery() {
  const images = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFKQt0yUHI0N2mgcfF6ysODqSylj_nKHwNYDhkwUNXWeRh8gyBPmbnxl-N_R3S7r-gIfCRXp4ZujdBUyPQEdV2rEvFfDdtxaN20xjD938kXkIkw82LBpzWTc_Dodi3xHlfzz_2tyIFA_aH0uIfxlOXlR9v2nF12RbHxLAVCbPBN9gP7PQJPR0r7DAxZUmkylrH7gaK5pKhO08yyCPIMSKStTXUKlMbxQmNarpCJInLEhrrA6VBzpaNwJtKmKABH3T0XPyOStWxSZqj",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWLo_lelvx7MmCJTjOvgdI2A6ukFs7FK598wrI2VvvuOxPANEEGgXawo0DtZiBFiUPBVUcOGKNhXSkDwg3bSIKP6NBQwSVlE6mZMRbHzY0CVzbOdcOMdYxuS53C0J8NwZx7-a1Xef6tRy9cQC5i89GXyBD4OaC7XWqxSxl0K72ak3IUWjcapfui60sCmJP3FyPr_xWDyg4D2fUF0IFb36mc-xKQoWZkU865Q-7fItKAdKDFavgOK9EgKyQHgTkbejPUuLt65OEL9RD",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBAG6uROs6EC-3OM7BOyVvN-w4GEh4hV_jLRrcX5a1eyCuozv0EN3TSKCo8FWTrxDM2s06pSjBuv_GtUvYDE94utW1uqbcvBaXiE9OXsIXCUGZTujR_QeZI6-aW4eSuvSjgyWu3Ye8T4FGe5AxKxs3NoDcYk3fsURZdbyaB2nEf0wtAlrLSAiTwsjLfRyT4xQeUoI35zgHBBy4YvInV9D1MilQ8HxfNVuupg45nOMrLbKUcuoyV__HZhXgegS8YJVu1Trx5gmJfXjte",
  ];

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] gap-1 sm:gap-2 rounded-xl overflow-hidden aspect-[3/2]">
      <div
        className="row-span-2 bg-cover bg-center"
        style={{ backgroundImage: `url(${images[0]})` }}
      />
      <div
        className="col-span-2 bg-cover bg-center"
        style={{ backgroundImage: `url(${images[1]})` }}
      />
      <div
        className="col-span-2 bg-cover bg-center"
        style={{ backgroundImage: `url(${images[2]})` }}
      />
    </div>
  );
}
