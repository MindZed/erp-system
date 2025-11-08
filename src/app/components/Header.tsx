"use client";

import SignOutButton from "@/app/components/SignOutButton";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fa7SolidHandBackFist,
  FluentPerson16Filled,
  JamMenu,
  MaterialSymbolsDashboard2Rounded,
  MindzedSvg,
  RiBuilding2Fill,
} from "./Svgs/svgs";
import DropdownButton from "./dropdown";
import { useState } from "react";
import ChangePasswordModal from "@/app/components/ChangePasswordModal";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    requiredRole: null,
    icon: <MaterialSymbolsDashboard2Rounded className="h-7 py-1 pr-2" />,
  },
  {
    name: "User Action",
    href: "/dashboard/admin/users",
    requiredRole: UserRole.ADMIN,
    icon: <Fa7SolidHandBackFist className="h-7 py-1.5 pr-2" />,
  },
  {
    name: "Client Action",
    href: "/dashboard/clients",
    requiredRole: UserRole.MANAGER,
    icon: <RiBuilding2Fill className="h-7 py-1.5 pr-2" />,
  },
];

const isLinkVisible = (
  linkRole: UserRole | null,
  userRole: UserRole
): boolean => {
  if (!linkRole) return true;
  const roleOrder = [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN];
  const requiredIndex = roleOrder.indexOf(linkRole);
  const userIndex = roleOrder.indexOf(userRole);
  return userIndex >= requiredIndex;
};

interface HeaderProps {
  userName: string;
  userRole: UserRole;
}

export default function Header({ userName, userRole }: HeaderProps) {
  const pathname = usePathname();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const uR = userRole.toLowerCase();
  return (
    <nav className="grid grid-cols-3 items-center py-4 px-6 border-b bg-zBlack text-zGrey-3 shadow-sm sticky top-0 z-10">
      <div className="flex">
        <div className="logo flex items-center">
          <div className="border-2 rounded-3xl px-3 mr-5">
            <JamMenu className="h-7" />
          </div>
        </div>

        <h2 className="text-lg font-semibold flex gap-2 text-white items-center">
          <MindzedSvg className="h-7" />
          <span>
            <span className="block">MINDZED</span>
            <span className="block -mt-3 text-base font-light">INFINITY</span>
          </span>
        </h2>
      </div>

      <div className="flex gap-2">
        {navItems.map((item) => {
          // RBAC CHECK
          const isActive = pathname === item.href;
          if (isLinkVisible(item.requiredRole as UserRole, userRole)) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`border-2 rounded-3xl px-3 flex items-center transition-colors bg-zGrey-1 ${isActive ? "text-primaryRed" : "hover:bg-zGrey-2"
                  }`}
              >
                <div className="flex items-center text-sm">
                  {item.icon}
                  <span className="text-zGrey-3">{item.name}</span>
                </div>
              </Link>
            );
          }
          return null;
        })}
      </div>

      {/* <div className="flex items-center space-x-4">
        <span className="text-sm">{userName}</span>
        <span className="text-sm capitalize"> ({uR})</span>
        <SignOutButton />
      </div> */}
      <div className="justify-self-end">
        <DropdownButton
          label={
            <div
              className="flex flex-col items-start leading-tight">
              <span className="font-semibold text-zGrey-3">{userName}</span>
              <span className="text-xs text-primaryRed font-semibold capitalize tracking-wide">
                {userRole.toLowerCase()}
              </span>
            </div>
          }
          reactCompo={[
            <button
              key="change-password"
              onClick={() => setShowPasswordModal(true)}
              className="w-full text-left px-4 py-2 text-zGrey-3 hover:bg-zGrey-2 rounded-md transition-colors duration-150"
            >
              Change Password
            </button>
            ,
            <SignOutButton key="signout" />
          ]}
          alignContent="right"
          labelSvg={<FluentPerson16Filled className="h-7 py-1 pr-2" />}
        />

        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}
      </div>
    </nav>
  );
}
