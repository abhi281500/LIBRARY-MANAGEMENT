import StatCard from "./StatCard.jsx";

function DashboardStats({ statistics }) {
  if (!statistics) {
    return null;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={statistics.totalStudents}
        description="Registered students"
      />

      <StatCard
        title="Total Seats"
        value={statistics.totalSeats}
        description="Seats in your library"
      />

      <StatCard
        title="Active Bookings"
        value={statistics.activeBookings}
        description="Currently active"
      />

      <StatCard
        title="Total Revenue"
        value={`₹${statistics.totalRevenue}`}
        description="Total paid revenue"
      />

      <StatCard
        title="Occupied Seats"
        value={statistics.occupiedSeats}
        description="Currently occupied"
      />

      <StatCard
        title="Available Seats"
        value={statistics.availableSeats}
        description="Ready for booking"
      />

      <StatCard
        title="Today's Revenue"
        value={`₹${statistics.todayRevenue}`}
        description="Revenue received today"
      />

      <StatCard
        title="Occupancy Rate"
        value={`${statistics.occupancyRate}%`}
        description="Current seat occupancy"
      />
    </div>
  );
}

export default DashboardStats;