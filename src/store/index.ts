import { configureStore } from "@reduxjs/toolkit";
import servicesReducer from "@/features/services/servicesSlice";
import bookingsReducer from "@/features/bookings/bookingsSlice";
import transactionsReducer from "@/features/transactions/transactionsSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import adminBarbersReducer from "@/features/admin/adminBarbersSlice";
import subscriptionReducer from "@/features/subscription/subscriptionSlice";
import userReducer from "@/features/user/userSlice";

export const store = configureStore({
  reducer: {
    services: servicesReducer,
    bookings: bookingsReducer,
    transactions: transactionsReducer,
    notifications: notificationsReducer,
    adminBarbers: adminBarbersReducer,
    subscription: subscriptionReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
