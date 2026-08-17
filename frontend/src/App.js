import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { RoleProvider } from "@/lib/role";
import Layout from "@/components/Layout";

// Citizen
import Home from "@/pages/Home";
import Report from "@/pages/Report";
import MyCases from "@/pages/MyCases";
import CaseDetails from "@/pages/CaseDetails";
import Analysis from "@/pages/Analysis";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import SafetyGuidelines from "@/pages/SafetyGuidelines";
import Login from "@/pages/Login";

// Level 1
import L1Home from "@/pages/l1/L1Home";
import L1Requests from "@/pages/l1/L1Requests";
import L1Cases from "@/pages/l1/L1Cases";
import L1Safety from "@/pages/l1/L1Safety";
import L1Profile from "@/pages/l1/L1Profile";

// Level 2
import L2Home from "@/pages/l2/L2Home";
import L2Assistance from "@/pages/l2/L2Assistance";
import L2Cases from "@/pages/l2/L2Cases";
import L2Safety from "@/pages/l2/L2Safety";
import L2Profile from "@/pages/l2/L2Profile";

// Level 3
import L3Home from "@/pages/l3/L3Home";
import L3Cases from "@/pages/l3/L3Cases";
import L3MyCases from "@/pages/l3/L3MyCases";
import L3Safety from "@/pages/l3/L3Safety";
import L3Profile from "@/pages/l3/L3Profile";
import L3Login from "@/pages/l3/L3Login";

// NGO
import NGOHome from "@/pages/ngo/NGOHome";
import NGOCases from "@/pages/ngo/NGOCases";
import NGOAssigned from "@/pages/ngo/NGOAssigned";
import NGOImpact from "@/pages/ngo/NGOImpact";
import NGOProfile from "@/pages/ngo/NGOProfile";
import NGOProfessionals from "@/pages/ngo/NGOProfessionals";

function App() {
    return (
        <ThemeProvider>
            <RoleProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            {/* Citizen */}
                            <Route index element={<Home />} />
                            <Route path="/home" element={<Navigate to="/" replace />} />
                            <Route path="/report" element={<Report />} />
                            <Route path="/cases" element={<MyCases />} />
                            <Route path="/cases/:caseId" element={<CaseDetails />} />
                            <Route path="/analysis" element={<Analysis />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/safety" element={<SafetyGuidelines />} />
                            <Route path="/login" element={<Login />} />

                            {/* Level 1 */}
                            <Route path="/l1" element={<L1Home />} />
                            <Route path="/l1/requests" element={<L1Requests />} />
                            <Route path="/l1/cases" element={<L1Cases />} />
                            <Route path="/l1/safety" element={<L1Safety />} />
                            <Route path="/l1/profile" element={<L1Profile />} />

                            {/* Level 2 */}
                            <Route path="/l2" element={<L2Home />} />
                            <Route path="/l2/assistance" element={<L2Assistance />} />
                            <Route path="/l2/cases" element={<L2Cases />} />
                            <Route path="/l2/safety" element={<L2Safety />} />
                            <Route path="/l2/profile" element={<L2Profile />} />

                            {/* Level 3 */}
                            <Route path="/l3" element={<L3Home />} />
                            <Route path="/l3/cases" element={<L3Cases />} />
                            <Route path="/l3/mycases" element={<L3MyCases />} />
                            <Route path="/l3/safety" element={<L3Safety />} />
                            <Route path="/l3/profile" element={<L3Profile />} />
                            <Route path="/l3/login" element={<L3Login />} />

                            {/* NGO */}
                            <Route path="/ngo" element={<NGOHome />} />
                            <Route path="/ngo/cases" element={<NGOCases />} />
                            <Route path="/ngo/assigned" element={<NGOAssigned />} />
                            <Route path="/ngo/impact" element={<NGOImpact />} />
                            <Route path="/ngo/profile" element={<NGOProfile />} />
                            <Route path="/ngo/professionals" element={<NGOProfessionals />} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
                <Toaster richColors position="top-center" />
            </RoleProvider>
        </ThemeProvider>
    );
}

export default App;
