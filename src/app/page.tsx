"use client";

import HomeHeader from "@/components/HomeHeader";
import SearchBar from "@/components/SearchBar";
import HeroBanner from "@/components/HeroBanner";
import FilterChips from "@/components/FilterChips";
import BarberCard from "@/components/BarberCard";
import BottomNav from "@/components/BottomNav";

export default function ClientHome() {
  const barbers = [
    {
      name: "Alex Stylist",
      location: "New York, NY",
      rating: 4.9,
      reviews: 120,
      price: 40,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD33gSBefn-k-BEvdL32eYNkqlsA-LKPrJ5pdVHGV1h6A_KzkfzUlblGP7RWtW-0C2jqs2bVJqXb5zkHwwuh5-AGzaxg0ULYqu-8kiSks_jBN6sPV-rkgMtYrVsirllBlQpTmwh3-eADDzgOSXWQccv0iqd9VCgNmqcys8bmf7_ZZMVliZ_G9vObmmTnPApPwybRPpsVmGNer7wzdARYHte_J3e_fefmXzEoYelIRAyz-9cB2QN5KTJdFWlZmkppJYpi1cYTpKeHTVp",
    },
    {
      name: "John Barber",
      location: "Brooklyn, NY",
      rating: 4.8,
      reviews: 98,
      price: 55,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAIG6PyPcEQQptfU1bDN89U7bVzi_mPITZFdK0-YvzhTPlh-8Hx4tbjaB8PsiHELpxhelk3TTq_msUXCIbxmnR3CKZ2Y2IHfVszljE99TdBk3YSN41OcLrYDZMnHw4qWAd6BjhAEpXSqkJBWajmihP9TOCIUVdhGkTtgXI0HqQnEP2ZQl4SXIoXj0X46QZuQ0Ac35oltcZndBDOyhcfh31HJpxm-mUNK3CRow_0kH3SX2PubEEzq1gfDJESOMkIBKWDPdqUpK_GLOA_",
    },
    {
      name: "Mike Fade",
      location: "Queens, NY",
      rating: 4.7,
      reviews: 215,
      price: 45,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuABC140HGDrsTutH7VC7xcksyiJBmxjMeinxFTSMkrqaaJDp9S5ZVKin4uheK2Q7deUqyPOcOIxQkbQxvRYIx4rVRtEjL54l_5GYxKtDTLh1biNmj3x4JyHFU0VJVcnJl_ASB8Kv-Mxauj4bTZzxW922Ji9KolekczwZb90eh-ypsOJBMZ_fWO_ufVBrXWo8z_GSUhDL0Ajmb2y8QI46FpN-xrXPGJGK7xziaMewPxyXYrBIHx2Iok1X1zHJxD5A7GQXFlP38ArX6J9",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark pb-24">
      <HomeHeader userName="Alex" />
      <main className="flex flex-col gap-4">
        <SearchBar placeholder="Search barbers, styles, location..." />
        <HeroBanner />
        <FilterChips />
        <section className="px-4">
          <h2 className="text-lg font-bold mb-2">Top Barbers Nearby</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">
            {barbers.map((barber, i) => (
              <BarberCard key={i} {...barber} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
