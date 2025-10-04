import React from "react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-300">
          For any queries please email to – info@synergymeetings.in
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <span className="text-orange-400">
            <a
              href="https://saascraft.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              Powered by SaaScraft Studio (India) Pvt. Ltd.
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
