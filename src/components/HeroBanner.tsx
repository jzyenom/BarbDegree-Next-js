export default function HeroBanner() {
  return (
    <div className="px-4">
      <div
        className="bg-cover bg-center rounded-xl min-h-[200px] flex flex-col justify-end overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.5), transparent 40%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMhPxfnZFiBhXzb_xJF-yqOxjowaLqPcEAvxx7_Ezk42NMXR0dpeeZhUDTVfhWHYexrNPOrMZU2HoTAgecVGC1J7MuBLEQSRDTeKglBZUern9UkVq8UdZ5PjK3aLpITmjbtVXK_ap-Y0jts1jPOerMpQ1UWuOo0oGqj_R2naOR9aAVJxTiATEoG7ryAf8_xkwFMEZ675nzj0liY6TjtqqJHi4xXa_XN8zUqXlC_gcnYh9nq0kRmbhPso1K7dr4wSjqj1s4BaH7OGrh")',
        }}
      >
        <p className="text-white text-[28px] font-bold leading-tight p-5">
          Find your trusted barber
        </p>
      </div>
    </div>
  );
}
