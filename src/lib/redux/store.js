import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobReducer from './slices/jobSlice';
import companyReducer from "./slices/companySlice";
import developerReducer from "./slices/developerSlice";
import skillReducer from "./slices/skillSlice";
import applicationReducer from "./slices/applicationSlice";
import employmentHistoryReducer from "./slices/employmentHistorySlice";
import notificationReducer from "./slices/notificationSlice";
import savedJobReducer from "./slices/savedJobSlice";
import recruiterReducer from "./slices/recruiterSlice";
import recruiterInvitationReducer from "./slices/recruiterInvitationSlice";
import recruiterHistoryReducer from "./slices/recruiterHistorySlice";
import companyJoinRequestReducer from "./slices/companyJoinRequestSlice";
import recruiterEventsReducer from "./slices/recruiterEventsSlice";
import employmentEventsReducer from "./slices/employmentEventsSlice";
import adminAnalyticsReducer from "./slices/adminAnalyticsSlice";
import adminUsersReducer from "./slices/adminUsersSlice";
import adminCompaniesReducer from "./slices/adminCompaniesSlice";
import adminEmploymentEventsReducer from "./slices/adminEmploymentEventsSlice";
import adminRecruiterEventsReducer from "./slices/adminRecruiterEventsSlice";
import adminFilesReducer from "./slices/adminFilesSlice";
import adminEmailLogsReducer from "./slices/adminEmailLogsSlice";
import adminHealthReducer from "./slices/adminHealthSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobReducer,
      company: companyReducer,
      developers: developerReducer,
      skills: skillReducer,
      applications: applicationReducer,
      employmentHistory: employmentHistoryReducer,
      notifications: notificationReducer,
      savedJobs: savedJobReducer,
      recruiter: recruiterReducer,
      recruiterInvitations: recruiterInvitationReducer,
      recruiterHistory: recruiterHistoryReducer,
      companyJoinRequests: companyJoinRequestReducer,
      recruiterEvents: recruiterEventsReducer,  
      employmentEvents: employmentEventsReducer,
      adminAnalytics: adminAnalyticsReducer,
      adminUsers: adminUsersReducer,
      adminCompanies: adminCompaniesReducer,
      adminEmploymentEvents: adminEmploymentEventsReducer,
      adminRecruiterEvents: adminRecruiterEventsReducer,
      adminFiles: adminFilesReducer,
      adminEmailLogs: adminEmailLogsReducer,
      adminHealth: adminHealthReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};
