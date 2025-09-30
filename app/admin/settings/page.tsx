"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Save,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Database,
} from "lucide-react";
import AdminLayout from "@/app/components/admin/AdminLayout";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  autoBackup: boolean;
  paymentGateway: {
    instamojo: {
      enabled: boolean;
      apiKey: string;
      authToken: string;
    };
  };
  emailService: {
    zepto: {
      enabled: boolean;
      apiUrl: string;
      token: string;
      fromEmail: string;
    };
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Hyatt Regency Pune & Residences",
    siteDescription: "Premium hotel booking system",
    contactEmail: "admin@hyattpune.com",
    supportPhone: "+91 20 6645 1234",
    currency: "INR",
    timezone: "Asia/Kolkata",
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoBackup: true,
    paymentGateway: {
      instamojo: {
        enabled: true,
        apiKey: "",
        authToken: "",
      },
    },
    emailService: {
      zepto: {
        enabled: true,
        apiUrl: "https://api.zeptomail.in/",
        token: "",
        fromEmail: "noreply@hyattpune.com",
      },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.settings) {
          setSettings(result.settings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage system configuration and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, supportPhone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Send booking confirmations via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Send booking updates via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">
                    Temporarily disable bookings
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <p className="text-sm text-gray-600">
                    Automatically backup data daily
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoBackup: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Gateway Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Gateway</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>Instamojo Integration</Label>
                  <p className="text-sm text-gray-600">
                    Enable Instamojo payment processing
                  </p>
                </div>
                <Switch
                  checked={settings.paymentGateway.instamojo.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      paymentGateway: {
                        ...settings.paymentGateway,
                        instamojo: {
                          ...settings.paymentGateway.instamojo,
                          enabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>

              {settings.paymentGateway.instamojo.enabled && (
                <>
                  <div>
                    <Label htmlFor="instamojoApiKey">API Key</Label>
                    <Input
                      id="instamojoApiKey"
                      type="password"
                      value={settings.paymentGateway.instamojo.apiKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentGateway: {
                            ...settings.paymentGateway,
                            instamojo: {
                              ...settings.paymentGateway.instamojo,
                              apiKey: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Instamojo API Key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instamojoAuthToken">Auth Token</Label>
                    <Input
                      id="instamojoAuthToken"
                      type="password"
                      value={settings.paymentGateway.instamojo.authToken}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paymentGateway: {
                            ...settings.paymentGateway,
                            instamojo: {
                              ...settings.paymentGateway.instamojo,
                              authToken: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter Instamojo Auth Token"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Email Service Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>ZeptoMail Integration</Label>
                  <p className="text-sm text-gray-600">
                    Enable ZeptoMail for sending emails
                  </p>
                </div>
                <Switch
                  checked={settings.emailService.zepto.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      emailService: {
                        ...settings.emailService,
                        zepto: {
                          ...settings.emailService.zepto,
                          enabled: checked,
                        },
                      },
                    })
                  }
                />
              </div>

              {settings.emailService.zepto.enabled && (
                <>
                  <div>
                    <Label htmlFor="zeptoApiUrl">API URL</Label>
                    <Input
                      id="zeptoApiUrl"
                      value={settings.emailService.zepto.apiUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailService: {
                            ...settings.emailService,
                            zepto: {
                              ...settings.emailService.zepto,
                              apiUrl: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="zeptoToken">API Token</Label>
                    <Input
                      id="zeptoToken"
                      type="password"
                      value={settings.emailService.zepto.token}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailService: {
                            ...settings.emailService,
                            zepto: {
                              ...settings.emailService.zepto,
                              token: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Enter ZeptoMail API Token"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zeptoFromEmail">From Email</Label>
                    <Input
                      id="zeptoFromEmail"
                      type="email"
                      value={settings.emailService.zepto.fromEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          emailService: {
                            ...settings.emailService,
                            zepto: {
                              ...settings.emailService.zepto,
                              fromEmail: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
