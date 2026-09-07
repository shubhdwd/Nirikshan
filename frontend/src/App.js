import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { RoleProvider, ProtectedRoute } from "@/lib/role";
import { AuthProvider } from "@/context/AuthContext";
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
import Signup from "@/pages/Signup";
import VerifyOTP from "@/pages/VerifyOTP";

// Level 1
import L1Home from "@/pages/l1/L1Home";
import L1Requests from "@/pages/l1/L1Requests";
import L1Cases from "@/pages/l1/L1Cases";
import L1Safety from "@/pages/l1/L1Safety";
import L1Profile from "@/pages/l1/L1Profile";
import L1Register from "@/pages/l1/L1Register";

// Level 2
import L2Home from "@/pages/l2/L2Home";
import L2Assistance from "@/pages/l2/L2Assistance";
import L2Cases from "@/pages/l2/L2Cases";
import L2Safety from "@/pages/l2/L2Safety";
import L2Profile from "@/pages/l2/L2Profile";
import L2Register from "@/pages/l2/L2Register";

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
import NGORegister from "@/pages/ngo/NGORegister";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RoleProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route element={<Layout />}>
                                {/* ========== PUBLIC ROUTES ========== */}
                                <Route index element={<Home />} />
                                <Route path="/home" element={<Navigate to="/" replace />} />
                                <Route path="/safety" element={<SafetyGuidelines />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/verify-otp" element={<VerifyOTP />} />

                                {/* ========== CITIZEN ROUTES (auth required) ========== */}
                                <Route path="/report" element={
                                    <ProtectedRoute><Report /></ProtectedRoute>
                                } />
                                <Route path="/cases" element={
                                    <ProtectedRoute><MyCases /></ProtectedRoute>
                                } />
                                <Route path="/cases/:caseId" element={
                                    <ProtectedRoute><CaseDetails /></ProtectedRoute>
                                } />
                                <Route path="/analysis" element={
                                    <ProtectedRoute><Analysis /></ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute><Profile /></ProtectedRoute>
                                } />
                                <Route path="/notifications" element={
                                    <ProtectedRoute><Notifications /></ProtectedRoute>
                                } />

                                {/* ========== LEVEL 1 ROUTES ========== */}
                                <Route path="/l1/register" element={
                                    <ProtectedRoute><L1Register /></ProtectedRoute>
                                } />
                                <Route path="/l1" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l1", "pcrn_l2", "admin"]}><L1Home /></ProtectedRoute>
                                } />
                                <Route path="/l1/requests" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l1", "pcrn_l2", "admin"]}><L1Requests /></ProtectedRoute>
                                } />
                                <Route path="/l1/cases" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l1", "pcrn_l2", "admin"]}><L1Cases /></ProtectedRoute>
                                } />
                                <Route path="/l1/safety" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l1", "pcrn_l2", "admin"]}><L1Safety /></ProtectedRoute>
                                } />
                                <Route path="/l1/profile" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l1", "pcrn_l2", "admin"]}><L1Profile /></ProtectedRoute>
                                } />

                                {/* ========== LEVEL 2 ROUTES ========== */}
                                <Route path="/l2/register" element={
                                    <ProtectedRoute><L2Register /></ProtectedRoute>
                                } />
                                <Route path="/l2" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l2", "admin"]}><L2Home /></ProtectedRoute>
                                } />
                                <Route path="/l2/assistance" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l2", "admin"]}><L2Assistance /></ProtectedRoute>
                                } />
                                <Route path="/l2/cases" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l2", "admin"]}><L2Cases /></ProtectedRoute>
                                } />
                                <Route path="/l2/safety" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l2", "admin"]}><L2Safety /></ProtectedRoute>
                                } />
                                <Route path="/l2/profile" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l2", "admin"]}><L2Profile /></ProtectedRoute>
                                } />

                                {/* ========== LEVEL 3 ROUTES ========== */}
                                <Route path="/l3/login" element={<L3Login />} />
                                <Route path="/l3" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l3", "admin"]}><L3Home /></ProtectedRoute>
                                } />
                                <Route path="/l3/cases" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l3", "admin"]}><L3Cases /></ProtectedRoute>
                                } />
                                <Route path="/l3/mycases" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l3", "admin"]}><L3MyCases /></ProtectedRoute>
                                } />
                                <Route path="/l3/safety" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l3", "admin"]}><L3Safety /></ProtectedRoute>
                                } />
                                <Route path="/l3/profile" element={
                                    <ProtectedRoute allowedRoles={["pcrn_l3", "admin"]}><L3Profile /></ProtectedRoute>
                                } />

                                {/* ========== NGO ROUTES ========== */}
                                <Route path="/ngo/register" element={
                                    <ProtectedRoute><NGORegister /></ProtectedRoute>
                                } />
                                <Route path="/ngo" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOHome /></ProtectedRoute>
                                } />
                                <Route path="/ngo/cases" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOCases /></ProtectedRoute>
                                } />
                                <Route path="/ngo/assigned" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOAssigned /></ProtectedRoute>
                                } />
                                <Route path="/ngo/impact" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOImpact /></ProtectedRoute>
                                } />
                                <Route path="/ngo/profile" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOProfile /></ProtectedRoute>
                                } />
                                <Route path="/ngo/professionals" element={
                                    <ProtectedRoute allowedRoles={["ngo", "admin"]}><NGOProfessionals /></ProtectedRoute>
                                } />

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                    <Toaster richColors position="top-center" />
                </RoleProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
