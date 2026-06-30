"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getCurrentUser,
  logout,
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
  listCredentials,
  saveCredential,
  deleteCredential,
  uploadAvatar,
  getAvatarPreview,
  deleteAvatar,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  seedCompanyDefaults,
} from "@/lib/appwrite";

// SVGs for platform icons
const Icons = {
  facebook: () => (
    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: () => (
    <svg className="h-5 w-5 text-[#E4405F]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  twitter: () => (
    <svg className="h-5 w-5 text-[#1DA1F2] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: () => (
    <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  youtube: () => (
    <svg className="h-5 w-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: () => (
    <svg className="h-5 w-5 text-[#000000] dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.12 1.25 2.7 2.06 4.31 2.37v3.83c-1.78-.17-3.48-.89-4.82-2.09-.15-.13-.29-.27-.43-.41-.12 1.4-.66 2.77-1.56 3.86-1.12 1.3-2.73 2.17-4.43 2.45-1.52.24-3.11-.08-4.42-.87-1.52-.94-2.58-2.54-2.92-4.29-.44-2.19.16-4.56 1.62-6.27C6.73 1.27 9.07.25 11.35.48c.4.05.8.14 1.18.28V4.7c-.55-.26-1.17-.38-1.77-.32-1.07.1-2.07.76-2.57 1.71-.58 1.05-.59 2.39-.02 3.45.54.98 1.56 1.62 2.68 1.68.79.03 1.58-.2 2.22-.68.64-.52.99-1.29 1.01-2.1v-8.5z"/>
    </svg>
  ),
  aws: () => (
    <svg className="h-5 w-5 text-[#FF9900]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.758 18.066c-.328.093-.728.163-1.198.209a9.664 9.664 0 0 1-1.39.046c-.958-.046-1.776-.231-2.452-.553a4.26 4.26 0 0 1-1.698-1.42c-.443-.655-.662-1.472-.662-2.45 0-.931.209-1.733.627-2.408.418-.675 1.037-1.197 1.855-1.567.818-.37 1.831-.555 3.037-.555.337 0 .683.017 1.04.052a7.618 7.618 0 0 1 1.04.148v-.385c0-.689-.138-1.22-.416-1.593-.277-.373-.787-.56-1.528-.56-.479 0-.96.096-1.442.289-.481.192-.916.483-1.303.873l-1.07-1.328a6.561 6.561 0 0 1 1.954-1.246 6.822 6.822 0 0 1 2.378-.403c1.558 0 2.68.396 3.366 1.189.686.793 1.028 1.996 1.028 3.608v5.828c0 .873.14 1.543.418 2.008h-2.146c-.08-.184-.15-.461-.212-.828zm-3.83-2.616c.404 0 .809-.057 1.215-.172.406-.115.762-.303 1.07-.563a3.178 3.178 0 0 0 .748-.992c.189-.419.283-.935.283-1.548V11.23a4.815 4.815 0 0 0-1.517-.234c-1.364 0-2.311.239-2.84.717-.528.479-.793 1.134-.793 1.966 0 .633.158 1.127.475 1.482.317.356.772.533 1.367.533z"/>
    </svg>
  ),
  godaddy: () => (
    <svg className="h-5 w-5 text-[#00B090]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  vercel: () => (
    <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 22.525H0L12 1.475l12 21.05z" />
    </svg>
  ),
  netlify: () => (
    <svg className="h-5 w-5 text-[#00AD9F]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.433 11.244L12.59 6.4a.82.82 0 0 0-1.173 0L6.58 11.237a.825.825 0 0 0 0 1.173l4.834 4.835a.82.82 0 0 0 1.173 0l4.846-4.835a.825.825 0 0 0 0-1.166zm-5.426 4.254l-3.666-3.666 3.666-3.666 3.666 3.666-3.666 3.666z"/>
    </svg>
  ),
  cloudflare: () => (
    <svg className="h-5 w-5 text-[#F38020]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.633 13.966c-.1-.366-.466-.633-.866-.633h-2.1c-.2 0-.367-.133-.4-.333a5.534 5.534 0 0 0-8.8-3.033c-.167.133-.4.167-.567.067a3.967 3.967 0 0 0-6.1 1.833c-.1.3-.367.5-.667.5H2c-.8 0-1.467.667-1.467 1.467 0 .533.267 1 .733 1.267l.1.066h21.4c.567-.3 1-.867.9-1.5l-.033-.133zm-2.033 1.334H2.4c-.267 0-.4-.167-.4-.333 0-.2.133-.334.4-.334h1.733c.533 0 1-.366 1.1-.9a2.634 2.634 0 0 1 4.1-1.267c.3.2.667.2.933 0a4.168 4.168 0 0 1 6.8 2.233c.1.534.567.934 1.1.934h2.133c.267 0 .4.167.4.333a.417.417 0 0 1-.4.334z"/>
    </svg>
  ),
  gcp: () => (
    <svg className="h-5 w-5 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.49 5.49 0 0 1 12 6c2.63 0 4.89 1.87 5.38 4.43l.3 1.5 1.53.11A3.5 3.5 0 0 1 22 15.5c0 1.93-1.57 3.5-3 3.5z"/>
    </svg>
  ),
  azure: () => (
    <svg className="h-5 w-5 text-[#0078D4]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.3 19.8l5.8-9.9 2.5 4.3L8 19.8zm13.4 0l-5.6-9.6L16 5.3l2.7 4.6zM13.2 4.2l-3 5.1L5.3 4.2h7.9zM0 19.8h6.4L12 10.2 5.6 10.2z"/>
    </svg>
  ),
  digitalocean: () => (
    <svg className="h-5 w-5 text-[#0080FF]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 18.8c-3.76 0-6.8-3.04-6.8-6.8s3.04-6.8 6.8-6.8c1.9 0 3.6.78 4.8 2.05L15 9.07c-.77-.77-1.83-1.27-3-1.27-2.32 0-4.2 1.88-4.2 4.2s1.88 4.2 4.2 4.2c1.17 0 2.23-.5 3-1.27l1.8 1.82c-1.2 1.27-2.9 2.05-4.8 2.05zm4.8-10h-2v2h2v-2zm2.6 3.6h-2v2h2v-2z"/>
    </svg>
  ),
  mailchimp: () => (
    <svg className="h-5 w-5 text-[#FFE01B]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
    </svg>
  ),
  github: () => (
    <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  stripe: () => (
    <svg className="h-5 w-5 text-[#635BFF]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.962 2.115c-1.127 0-2.446.467-2.446 2.116 0 2.285 3.167 1.923 3.167 2.923 0 .341-.301.55-.838.55-1.078 0-2.35-.453-2.35-.453l-.534 2.14s1.206.494 2.684.494c2.257 0 3.336-1.042 3.336-2.33 0-2.358-3.168-1.922-3.168-2.916 0-.324.283-.493.766-.493.856 0 1.982.352 1.982.352l.533-2.1c0 0-1.02-.383-2.098-.383zm-8.86 6.305c-1.127 0-2.446.467-2.446 2.116 0 2.285 3.167 1.923 3.167 2.923 0 .341-.301.55-.838.55-1.078 0-2.35-.453-2.35-.453l-.534 2.14s1.206.494 2.684.494c2.257 0 3.336-1.042 3.336-2.33 0-2.358-3.168-1.922-3.168-2.916 0-.324.283-.493.766-.493.856 0 1.982.352 1.982.352l.533-2.1c0 0-1.02-.383-2.098-.383z"/>
    </svg>
  ),
  shopify: () => (
    <svg className="h-5 w-5 text-[#96BF48]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.5 6.075h-3v-.75c0-1.238-.987-2.25-2.25-2.25h-4.5C8.513 3.075 7.525 4.087 7.525 5.325v.75h-3c-.413 0-.75.337-.75.75L3 20.25c0 .413.337.75.75.75h16.5c.413 0 .75-.337.75-.75l-.75-13.425c0-.413-.337-.75-.75-.75zm-10.5-.75c0-.413.337-.75.75-.75h4.5c.413 0 .75.337.75.75v.75H9v-.75z"/>
    </svg>
  ),
  figma: () => (
    <svg className="h-5 w-5 text-[#F24E1E]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C9.24 2 7 4.24 7 7c0 1.64.8 3.1 2.03 4C7.8 11.9 7 13.36 7 15c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.64-.8-3.1-2.03-4C16.2 10.1 17 8.64 17 7c0-2.76-2.24-5-5-5zm-2.5 5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm2.5 10.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  canva: () => (
    <svg className="h-5 w-5 text-[#00C4CC]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v5z"/>
    </svg>
  ),
  slack: () => (
    <svg className="h-5 w-5 text-[#4A154B]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-5.043a2.528 2.528 0 0 1-2.52-2.52zm12.655-6.329a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.26 0a2.528 2.528 0 0 1-2.522 2.52h-5.043a2.528 2.528 0 0 1-2.52-2.52 2.528 2.528 0 0 1 2.52-2.522h5.043a2.528 2.528 0 0 1 2.522 2.522v2.52z"/>
    </svg>
  ),
  discord: () => (
    <svg className="h-5 w-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011 13.92 13.92 0 0 0 12.244 0 .075.075 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
    </svg>
  ),
  whatsapp: () => (
    <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  wordpress: () => (
    <svg className="h-5 w-5 text-[#21759B]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.158 12.786l-2.698 7.84c1.742.512 3.583.504 5.318-.016l-2.62-7.824zm-4.32-6.552c.677-.024 1.29.352 1.52.923l1.83 4.542-3.14 9.176c-3.14-2.18-5.048-5.836-5.048-9.875 0-3.167 1.29-6.035 3.37-8.082 1.13-.538 1.468-.684 1.468-.684zm11.75 3.6c.01 1.45-.63 2.5-1.37 3.63l-2.48 6.552-3.56-10.3c.725-.04 1.385-.23 1.385-.23l.1-.383-.8-.01-1.36.01c-.8 0-1.52-.016-1.52-.016l.1.383.74.024 2.82 8.16 1.83-5.26c-.46-.774-1.026-1.46-1.46-2.15-.36-.572-.693-1.096-.693-1.782 0-.895.733-1.724 1.942-1.724.896 0 1.54.408 1.94 1.137zm-7.588-7.834c4.965 0 9.025 4.06 9.025 9.025 0 1.983-.642 3.824-1.734 5.334L14.7 4.14c.726-.04 1.386-.23 1.386-.23l.1-.384-2.8-.01-1.4.01V2.025z"/>
    </svg>
  ),
  google: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  outlook: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#0078D4" d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" />
      <path fill="#FFFFFF" d="M6 7.5c0-.83.67-1.5 1.5-1.5h9c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 016 16.5v-9z" />
      <path fill="#0078D4" d="M12 11.25L7.5 8.25v6L12 11.25z" />
      <path fill="#50E4FF" d="M12 11.25l4.5-3v6l-4.5-3z" />
      <path fill="#106EBE" d="M12 11.25L7.5 8.25h9l-4.5 3z" />
    </svg>
  ),
  generic: () => (
    <svg className="h-5 w-5 text-muted dark:text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

const getUniqueMonogramIcon = (name) => {
  const cleanName = (name || "P").trim();
  const char = cleanName.charAt(0).toUpperCase();
  
  // Simple hashing algorithm to get a unique color hue
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  
  // Premium HSL values: saturation 60%, lightness 42%
  const bgColor = `hsl(${hue}, 60%, 42%)`;
  
  return (
    <div 
      className="w-full h-full rounded flex items-center justify-center font-bold text-white text-[10px] select-none" 
      style={{ backgroundColor: bgColor }}
    >
      {char}
    </div>
  );
};

const getIcon = (platformName, categoryName, customIcon) => {
  const iconKey = (customIcon || "").toLowerCase().trim();
  if (iconKey && iconKey !== "monogram" && Icons[iconKey]) {
    // If it's a social icon, ensure it's only shown if it's the Social Media category (as per constraints)
    const isSocialIcon = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok", "whatsapp"].includes(iconKey);
    const isSocialCategory = (categoryName || "").toLowerCase().trim() === "social media";
    if (!isSocialIcon || isSocialCategory) {
      return Icons[iconKey]();
    }
  }

  const norm = (platformName || "").toLowerCase().trim();
  const catNorm = (categoryName || "").toLowerCase().trim();
  const isSocialCategory = catNorm === "social media";

  if (isSocialCategory) {
    if (norm.includes("facebook") || norm === "fb") return Icons.facebook();
    if (norm.includes("instagram") || norm === "insta") return Icons.instagram();
    if (norm.includes("twitter") || norm === "x") return Icons.twitter();
    if (norm.includes("linkedin")) return Icons.linkedin();
    if (norm.includes("youtube") || norm === "yt") return Icons.youtube();
    if (norm.includes("tiktok")) return Icons.tiktok();
  }

  // Predefined non-social platform icons (available globally/in any category)
  if (norm.includes("aws") || norm.includes("amazon")) return Icons.aws();
  if (norm.includes("godaddy")) return Icons.godaddy();
  if (norm.includes("vercel")) return Icons.vercel();
  if (norm.includes("netlify")) return Icons.netlify();
  if (norm.includes("cloudflare")) return Icons.cloudflare();
  if (norm.includes("google cloud") || norm === "gcp") return Icons.gcp();
  if (norm.includes("google") || norm === "g") return Icons.google();
  if (norm.includes("outlook") || norm.includes("office365") || norm.includes("microsoft mail")) return Icons.outlook();
  if (norm.includes("azure")) return Icons.azure();
  if (norm.includes("digitalocean") || norm === "do") return Icons.digitalocean();
  if (norm.includes("mailchimp")) return Icons.mailchimp();
  if (norm.includes("github")) return Icons.github();
  if (norm.includes("stripe")) return Icons.stripe();
  if (norm.includes("shopify")) return Icons.shopify();
  if (norm.includes("figma")) return Icons.figma();
  if (norm.includes("canva")) return Icons.canva();
  if (norm.includes("slack")) return Icons.slack();
  if (norm.includes("discord")) return Icons.discord();
  if (norm.includes("whatsapp")) return Icons.whatsapp();
  if (norm.includes("wordpress") || norm === "wp") return Icons.wordpress();

  // Fallback: unique color and monogram hash
  return getUniqueMonogramIcon(platformName);
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Data states
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  
  // Modals / forms
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyFile, setNewCompanyFile] = useState(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);

  // Credentials management states
  const [credentials, setCredentials] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Social Media");
  
  const [platforms, setPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Modals for Categories & Platform Creation / Editing
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");

  // Modal for Credential editing
  const [showCredModal, setShowCredModal] = useState(false);
  const [activePlatform, setActivePlatform] = useState("");
  const [credUsername, setCredUsername] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credCustomerId, setCredCustomerId] = useState("");
  const [credExpirationDate, setCredExpirationDate] = useState("");
  const [credPin, setCredPin] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingCred, setIsSavingCred] = useState(false);
  const [isClearingCred, setIsClearingCred] = useState(false);
  const [isEditingCred, setIsEditingCred] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modal Platform Settings Sub-states
  const [showPlatformSettings, setShowPlatformSettings] = useState(false);
  const [editPlatformName, setEditPlatformName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("monogram");
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);
  const [isDeletingPlatform, setIsDeletingPlatform] = useState(false);

  // Custom Popup Alert / Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    actionLabel: "Confirm",
    onConfirm: null
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const showConfirm = (title, message, actionLabel, actionCallback) => {
    setConfirmModal({
      show: true,
      title,
      message,
      actionLabel,
      onConfirm: () => {
        actionCallback();
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Toast automatic dismiss
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Authentication check
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
        } else {
          setUser(currentUser);
          await loadCompanies();
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, [router]);

  // Lazy initial state for theme
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }
    return 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/login");
    }
  };

  // Load Companies
  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const docs = await listCompanies();
      setCompanies(docs);
      if (docs.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(docs[0].$id);
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load Categories list from DB
  const loadCategoriesList = async (companyId = selectedCompanyId) => {
    if (!companyId) return;
    try {
      const docs = await listCategories(companyId);
      setCategories(docs);
      if (docs.length > 0) {
        const names = docs.map(d => d.name);
        if (!names.includes(activeCategory)) {
          setActiveCategory(names[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  // Fetch Categories and seed defaults when selectedCompanyId changes
  useEffect(() => {
    if (!selectedCompanyId) {
      setCategories([]);
      setActiveCategory("Social Media");
      return;
    }

    async function initCompanyData() {
      try {
        await seedCompanyDefaults(selectedCompanyId);
        await loadCategoriesList(selectedCompanyId);
      } catch (err) {
        console.error("Failed to initialize company categories:", err);
      }
    }
    initCompanyData();
  }, [selectedCompanyId]);

  // Fetch Platforms when activeCategory or selectedCompanyId changes
  useEffect(() => {
    if (!activeCategory || !selectedCompanyId) {
      setPlatforms([]);
      return;
    }

    async function loadPlatformsList() {
      setLoadingPlatforms(true);
      try {
        const docs = await listPlatforms(activeCategory, selectedCompanyId);
        setPlatforms(docs);
        // Reset activePlatform when switching companies to prevent accidental cross-company deletions
        setActivePlatform("");
      } catch (e) {
        console.error("Failed to load platforms:", e);
      } finally {
        setLoadingPlatforms(false);
      }
    }
    loadPlatformsList();
  }, [activeCategory, selectedCompanyId]);

  // Fetch Credentials when company is selected
  useEffect(() => {
    if (!selectedCompanyId) {
      setCredentials([]);
      return;
    }

    async function loadCompanyCredentials() {
      setLoadingCredentials(true);
      try {
        const docs = await listCredentials(selectedCompanyId);
        setCredentials(docs);

        // Sync edit name state
        const current = companies.find(c => c.$id === selectedCompanyId);
        if (current) {
          setEditCompanyName(current.name);
        }
      } catch (err) {
        console.error("Failed to load credentials:", err);
      } finally {
        setLoadingCredentials(false);
      }
    }
    loadCompanyCredentials();

    // Reset platform-related states when company changes
    setActivePlatform("");
    setShowCredModal(false);
    setShowPlatformSettings(false);
  }, [selectedCompanyId, companies]);

  // Create Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setIsCreatingCompany(true);
    try {
      let avatarId = null;
      if (newCompanyFile) {
        avatarId = await uploadAvatar(newCompanyFile);
      }
      
      const newCompany = await createCompany(newCompanyName, avatarId);
      setNewCompanyName("");
      setNewCompanyFile(null);
      setShowAddCompany(false);
      
      // Refresh list & select new
      const docs = await listCompanies();
      setCompanies(docs);
      setSelectedCompanyId(newCompany.$id);
      showToast("Company created successfully!", "success");
    } catch (err) {
      console.error("Failed to create company:", err);
      showToast(err.message || "Failed to create company", "error");
    } finally {
      setIsCreatingCompany(false);
    }
  };

  // Update Company Avatar
  const handleUploadNewAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompanyId || !currentCompany) return;
    setIsSavingSettings(true);
    try {
      const newAvatarId = await uploadAvatar(file);
      
      // Delete old file if present
      if (currentCompany.avatarId) {
        try {
          await deleteAvatar(currentCompany.avatarId);
        } catch (e) {}
      }
      
      await updateCompany(selectedCompanyId, undefined, undefined, newAvatarId);
      await loadCompanies();
      showToast("Company logo updated!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload logo: " + err.message, "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Remove Company Avatar
  const handleRemoveAvatar = async () => {
    if (!selectedCompanyId || !currentCompany || !currentCompany.avatarId) return;
    showConfirm(
      "Remove Logo", 
      "Are you sure you want to remove the company logo?", 
      "Remove", 
      async () => {
        setIsSavingSettings(true);
        try {
          await deleteAvatar(currentCompany.avatarId);
          await updateCompany(selectedCompanyId, undefined, undefined, null);
          await loadCompanies();
          showToast("Logo removed.", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to remove logo: " + err.message, "error");
        } finally {
          setIsSavingSettings(false);
        }
      }
    );
  };

  // Toggle company status (Active / Archived)
  const handleToggleStatus = async (company) => {
    const nextStatus = company.status === "active" ? "archived" : "active";
    try {
      await updateCompany(company.$id, undefined, nextStatus);
      const docs = await listCompanies();
      setCompanies(docs);
      showToast(`Company status updated to ${nextStatus}.`, "success");
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Save Settings (Company Rename)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editCompanyName.trim() || !selectedCompanyId) return;
    setIsSavingSettings(true);
    try {
      await updateCompany(selectedCompanyId, editCompanyName);
      const docs = await listCompanies();
      setCompanies(docs);
      showToast("Company name updated!", "success");
    } catch (err) {
      console.error("Failed to update company name:", err);
      showToast(err.message || "Failed to update company", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async () => {
    if (!selectedCompanyId) return;
    const currentComp = companies.find(c => c.$id === selectedCompanyId);
    if (!currentComp) return;

    showConfirm(
      "Delete Company",
      `Are you sure you want to delete '${currentComp.name}' permanently? This will delete all credentials and settings associated with this company.`,
      "Delete",
      async () => {
        setIsDeletingCompany(true);
        try {
          await deleteCompany(selectedCompanyId);
          const docs = await listCompanies();
          setCompanies(docs);
          
          if (docs.length > 0) {
            setSelectedCompanyId(docs[0].$id);
          } else {
            setSelectedCompanyId(null);
          }
          showToast("Company deleted successfully.", "success");
        } catch (err) {
          console.error("Failed to delete company:", err);
          showToast(err.message || "Failed to delete company", "error");
        } finally {
          setIsDeletingCompany(false);
        }
      }
    );
  };

  // ADD CATEGORY (DATABASE SYNC)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !selectedCompanyId) return;
    const cat = newCategoryName.trim();
    try {
      await createCategory(cat, selectedCompanyId);
      await loadCategoriesList(selectedCompanyId);
      setActiveCategory(cat);
      setNewCategoryName("");
      setShowAddCategory(false);
      showToast(`Category "${cat}" added successfully!`, "success");
    } catch (err) {
      console.error("Failed to add category:", err);
      showToast("Failed to add category: " + err.message, "error");
    }
  };

  // ADD PLATFORM (DATABASE SYNC)
  const handleAddPlatform = async (e) => {
    e.preventDefault();
    if (!newPlatformName.trim() || !activeCategory || !selectedCompanyId) return;
    const plat = newPlatformName.trim();
    try {
      await createPlatform(
        activeCategory, 
        plat, 
        selectedIcon === "monogram" ? null : selectedIcon,
        selectedCompanyId
      );
      const docs = await listPlatforms(activeCategory, selectedCompanyId);
      setPlatforms(docs);
      setNewPlatformName("");
      setSelectedIcon("monogram");
      setShowAddPlatform(false);
      showToast(`Platform "${plat}" added to "${activeCategory}" successfully!`, "success");
    } catch (err) {
      console.error("Failed to add platform:", err);
      showToast("Failed to add platform: " + err.message, "error");
    }
  };

  // EDIT / DELETE CATEGORIES (DATABASE SYNC)
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const activeDoc = categories.find(c => c.name === activeCategory);
    if (!activeDoc || !editCategoryName.trim() || !selectedCompanyId) return;
    const newName = editCategoryName.trim();
    if (newName === activeCategory) {
      setShowEditCategory(false);
      return;
    }
    setIsSavingCategory(true);
    try {
      await updateCategory(activeDoc.$id, activeCategory, newName, selectedCompanyId);
      await loadCategoriesList(selectedCompanyId);
      setActiveCategory(newName);
      setShowEditCategory(false);
      showToast("Category renamed successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to rename category: " + err.message, "error");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    const activeDoc = categories.find(c => c.name === activeCategory);
    if (!activeDoc || !selectedCompanyId) return;
    showConfirm(
      "Delete Category",
      `Are you sure you want to delete category "${activeCategory}"? This will delete all platforms and credentials under this category permanently.`,
      "Delete",
      async () => {
        setIsDeletingCategory(true);
        try {
          await deleteCategory(activeDoc.$id, activeCategory, selectedCompanyId);
          await loadCategoriesList(selectedCompanyId);
          showToast("Category deleted successfully.", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to delete category: " + err.message, "error");
        } finally {
          setIsDeletingCategory(false);
        }
      }
    );
  };

  // COPY TO CLIPBOARD
  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, "success");
  };

  // OPEN EDIT MODAL FOR A PLATFORM
  const openCredModal = (platformName) => {
    setActivePlatform(platformName);
    const activePlatDoc = platforms.find(p => p.name === platformName);
    setSelectedIcon(activePlatDoc && activePlatDoc.icon ? activePlatDoc.icon : "monogram");
    setEditPlatformName(platformName);
    setShowPlatformSettings(false);
    
    // Find if credentials already exist
    const doc = credentials.find(
      c => c.category === activeCategory && c.platform === platformName
    );

    if (doc) {
      setCredUsername(doc.username || "");
      setCredPassword(doc.password || "");
      setCredCustomerId(doc.customerId || "");
      setCredExpirationDate(doc.expirationDate || "");
      setCredPin(doc.pin || "");
      setShowOptionalFields(!!(doc.customerId || doc.expirationDate || doc.pin));
      setIsEditingCred(false);
    } else {
      setCredUsername("");
      setCredPassword("");
      setCredCustomerId("");
      setCredExpirationDate("");
      setCredPin("");
      setShowOptionalFields(false);
      setIsEditingCred(true);
    }
    setShowPassword(false);
    setShowCredModal(true);
  };

  // SAVE CREDENTIALS
  const handleSaveCred = async (e) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setIsSavingCred(true);
    try {
      await saveCredential(
        selectedCompanyId,
        activeCategory,
        activePlatform,
        credUsername,
        credPassword,
        credCustomerId,
        credExpirationDate,
        credPin
      );
      
      const docs = await listCredentials(selectedCompanyId);
      setCredentials(docs);
      setShowCredModal(false);
      showToast(`Credentials for ${activePlatform} saved successfully!`, "success");
    } catch (err) {
      console.error("Failed to save credentials:", err);
      showToast(err.message || "Failed to save credentials", "error");
    } finally {
      setIsSavingCred(false);
    }
  };

  // CLEAR CREDENTIALS
  const handleClearCred = async () => {
    const doc = credentials.find(
      c => c.category === activeCategory && c.platform === activePlatform
    );
    if (!doc) return;
    
    showConfirm(
      "Clear Access",
      `Are you sure you want to clear credentials for ${activePlatform}?`,
      "Clear",
      async () => {
        setIsClearingCred(true);
        try {
          await deleteCredential(doc.$id);
          
          const docs = await listCredentials(selectedCompanyId);
          setCredentials(docs);
          setShowCredModal(false);
          showToast(`Credentials for ${activePlatform} cleared.`, "success");
        } catch (err) {
          console.error("Failed to delete credentials:", err);
          showToast(err.message || "Failed to clear credentials", "error");
        } finally {
          setIsClearingCred(false);
        }
      }
    );
  };

  // PLATFORM CUSTOMIZATION OPERATIONS
  const handleUpdatePlatformSettings = async (e) => {
    e.preventDefault();
    const activePlatDoc = platforms.find(p => p.name === activePlatform);
    if (!activePlatDoc || !editPlatformName.trim() || !selectedCompanyId) return;
    const newName = editPlatformName.trim();
    setIsSavingPlatform(true);
    try {
      await updatePlatform(
        activePlatDoc.$id,
        activeCategory,
        activePlatform,
        newName,
        selectedIcon === "monogram" ? null : selectedIcon,
        selectedCompanyId
      );
      
      // Reload platforms & credentials list
      const docs = await listPlatforms(activeCategory, selectedCompanyId);
      setPlatforms(docs);
      
      const credDocs = await listCredentials(selectedCompanyId);
      setCredentials(credDocs);
      
      setActivePlatform(newName);
      setShowPlatformSettings(false);
      showToast("Platform settings updated!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update platform: " + err.message, "error");
    } finally {
      setIsSavingPlatform(false);
    }
  };

  const handleDeletePlatform = async () => {
    const activePlatDoc = platforms.find(p => p.name === activePlatform);
    if (!activePlatDoc || !selectedCompanyId) return;
    showConfirm(
      "Delete Platform",
      `Are you sure you want to delete platform "${activePlatform}" permanently? This will clear its credentials too.`,
      "Delete",
      async () => {
        setIsDeletingPlatform(true);
        try {
          await deletePlatform(activePlatDoc.$id, activeCategory, activePlatform, selectedCompanyId);
          const docs = await listPlatforms(activeCategory, selectedCompanyId);
          setPlatforms(docs);
          
          const credDocs = await listCredentials(selectedCompanyId);
          setCredentials(credDocs);
          
          setShowCredModal(false);
          showToast("Platform deleted successfully.", "success");
        } catch (err) {
          console.error(err);
          showToast("Failed to delete platform: " + err.message, "error");
        } finally {
          setIsDeletingPlatform(false);
        }
      }
    );
  };

  const currentCompany = companies.find(c => c.$id === selectedCompanyId);

  // Splash Screen
  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-hairline border-t-primary"></div>
          <span className="text-xs uppercase tracking-wider font-semibold text-muted">Loading Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-body font-sans select-none animate-fadeIn relative">
      
      {/* SIDEBAR BACKDROP FOR MOBILE */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-45 flex w-72 flex-col bg-canvas-soft border-r border-hairline text-body transition-transform duration-300 md:static md:translate-x-0 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-hairline px-6 bg-canvas-soft">
          <div className="flex items-center gap-2.5">
            <Image 
              src="/logo.png" 
              alt="Digital Marketing Logo" 
              width={28}
              height={28}
              className="h-7 w-7 rounded object-cover shadow-sm border border-hairline-soft"
              priority
            />
            <span className="font-normal tracking-[-0.04em] text-ink text-base">Digital Marketing Console</span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-surface-strong text-muted hover:text-ink transition"
            aria-label="Close sidebar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User profile section */}
        <div className="flex items-center justify-between border-b border-hairline bg-canvas-soft/80 p-4 px-6 text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="h-6 w-6 rounded-full bg-surface-strong border border-hairline flex items-center justify-center text-ink text-[9px] font-semibold uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : "AD"}
            </div>
            <div className="truncate">
              <p className="font-semibold text-ink truncate w-32">{user?.name || user?.email}</p>
              <p className="text-[9px] text-primary uppercase font-bold tracking-wider">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="rounded p-1 hover:bg-surface-strong text-muted hover:text-ink transition duration-150"
            title="Log Out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Sidebar list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Companies</span>
              <button 
                onClick={() => setShowAddCompany(true)}
                className="inline-flex items-center gap-1 rounded border border-hairline-strong bg-surface-card px-2.5 py-1 text-[10px] font-bold text-ink hover:bg-canvas-soft transition duration-150 shadow-sm"
              >
                + ADD
              </button>
            </div>

            {loadingCompanies ? (
              <div className="py-8 text-center text-xs text-muted-soft">Loading...</div>
            ) : companies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-hairline p-4 text-center text-xs text-muted-soft">
                No companies added yet.
              </div>
            ) : (
              <div className="space-y-1">
                {companies.map((company) => {
                  const isSelected = selectedCompanyId === company.$id;
                  
                  return (
                    <div 
                      key={company.$id} 
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-xl border transition duration-150 ${
                        isSelected 
                          ? "bg-surface-card border-hairline text-ink font-medium shadow-sm" 
                          : "border-transparent text-muted hover:bg-surface-strong/20 hover:text-ink"
                      }`}
                      onClick={() => {
                        setSelectedCompanyId(company.$id);
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {/* Company logo/avatar preview or placeholder */}
                        {company.avatarId ? (
                          <Image 
                            src={getAvatarPreview(company.avatarId)} 
                            alt={company.name} 
                            width={18}
                            height={18}
                            className="h-4.5 w-4.5 rounded-full object-cover shrink-0 border border-hairline-soft"
                          />
                        ) : (
                          <div className="h-4.5 w-4.5 rounded-full bg-surface-strong text-ink text-[8px] font-bold flex items-center justify-center shrink-0">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-xs">{company.name}</span>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${company.status === 'active' ? 'bg-primary' : 'bg-muted-soft'}`}></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar Footer */}
        <div className="border-t border-hairline p-4 text-center text-[10px] text-muted-soft uppercase tracking-[0.05em]">
          Digital Marketing Console v1.0
        </div>
      </aside>

      {/* MAIN CONTENT PANE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-canvas">
        
        {/* TOP BAR */}
        <header className="h-16 border-b border-hairline bg-surface-card flex items-center justify-between px-4 md:px-8">
          {currentCompany ? (
            <div className="flex items-center gap-2 md:gap-3 truncate">
              {/* Hamburger Menu button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-1 rounded hover:bg-surface-strong text-muted hover:text-ink md:hidden transition mr-1 shrink-0"
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {currentCompany.avatarId ? (
                <Image 
                  src={getAvatarPreview(currentCompany.avatarId)} 
                  alt={currentCompany.name} 
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover border border-hairline shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-surface-strong text-ink text-[10px] font-bold flex items-center justify-center shrink-0">
                  {currentCompany.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <h2 className="text-sm md:text-base font-normal text-ink tracking-[-0.03em] truncate max-w-[120px] sm:max-w-none">{currentCompany.name}</h2>
              <span className={`rounded-full text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider shrink-0 ${
                currentCompany.status === 'active' ? 'bg-surface-strong text-ink border border-hairline' : 'bg-canvas text-muted-soft border border-hairline-soft'
              }`}>
                {currentCompany.status}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Hamburger Menu button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-1 rounded hover:bg-surface-strong text-muted hover:text-ink md:hidden transition mr-1 shrink-0"
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-sm md:text-base font-normal text-ink tracking-[-0.03em]">Console Overview</h2>
            </div>
          )}
          
          <div className="flex items-center gap-3 sm:gap-6 text-[10px] text-muted-soft uppercase tracking-[0.05em] shrink-0">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-hairline bg-canvas hover:bg-surface-strong text-ink hover:text-ink transition duration-150 font-sans tracking-normal"
            >
              <span>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</span>
            </button>
            <span className="hidden sm:inline">Date: {new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {!selectedCompanyId ? (
            /* EMPTY STATE */
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-xl border border-hairline bg-surface-card p-5 flex items-center justify-center text-2xl shadow-sm">
                🏢
              </div>
              <h3 className="text-lg font-normal text-ink tracking-[-0.03em]">Welcome to Digital Marketing Console</h3>
              <p className="mt-2 text-xs text-muted max-w-xs leading-relaxed">
                Provide clean brand parameters and database controls. Create or select a company from the sidebar to manage credentials and upload logos.
              </p>
              <button 
                onClick={() => setShowAddCompany(true)}
                className="mt-6 rounded-md bg-primary hover:bg-primary-active px-5 py-2 text-xs font-medium text-white transition duration-150 shadow-sm"
              >
                + Create Company
              </button>
            </div>
          ) : (
            /* COMPANY CREDENTIALS & INFO VIEW */
            <div className="space-y-8 w-full">
              
              {/* Category tabs list */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map((catDoc) => {
                      const cat = catDoc.name;
                      const isActive = activeCategory === cat;
                      return (
                        <div key={catDoc.$id || cat} className="flex items-center gap-1 bg-surface-strong/10 rounded-md border border-hairline-soft p-0.5">
                          <button
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-[0.05em] transition duration-150 ${
                              isActive
                                ? "bg-surface-strong text-ink border border-hairline-strong"
                                : "text-muted hover:text-ink hover:bg-surface-strong/30"
                            }`}
                          >
                            {cat}
                          </button>
                          {isActive && (
                            <button
                              onClick={() => {
                                setEditCategoryName(cat);
                                setShowEditCategory(true);
                              }}
                              className="p-1 rounded hover:bg-surface-strong text-muted hover:text-ink transition cursor-pointer"
                              title="Edit Category Name"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="px-2 py-1 rounded-md text-xs font-bold text-primary hover:underline transition ml-1"
                    >
                      + Add Category
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedIcon("monogram");
                      setShowAddPlatform(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded border border-hairline-strong bg-surface-card px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-soft transition duration-150 shadow-sm w-full sm:w-auto"
                  >
                    + Add Platform
                  </button>
                </div>

                {/* Grid block display of platforms */}
                {loadingPlatforms ? (
                  <div className="py-20 text-center text-xs text-muted-soft">Fetching platform records...</div>
                ) : platforms.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-hairline bg-surface-card p-12 text-center">
                    <h4 className="font-normal text-ink text-sm">No platforms registered</h4>
                    <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                      There are no platforms in this category. Click &quot;+ Add Platform&quot; to create one.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {platforms.map((platDoc) => {
                      const plat = platDoc.name;
                      const credDoc = credentials.find(
                        c => c.category === activeCategory && c.platform === plat
                      );
                      const isComplete = credDoc && (credDoc.username || credDoc.password || credDoc.customerId || credDoc.expirationDate || credDoc.pin);

                      return (
                        <div
                          key={platDoc.$id || plat}
                          onClick={() => openCredModal(plat)}
                          className="rounded-lg border border-hairline bg-surface-card p-4 flex items-center justify-between cursor-pointer hover:border-hairline-strong hover:bg-canvas-soft/40 transition duration-150 shadow-sm group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="h-9 w-9 rounded-md border border-hairline bg-canvas-soft flex items-center justify-center shrink-0 overflow-hidden">
                              {getIcon(plat, activeCategory, platDoc.icon)}
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-semibold text-ink truncate">{plat}</h4>
                              <p className="text-[10px] text-muted-soft truncate w-32">
                                {isComplete ? (credDoc.username || "Has Access") : "No Access Added"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isComplete ? (
                              <div className="h-5.5 w-5.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                ✓
                              </div>
                            ) : (
                              <div className="h-5.5 w-5.5 rounded-full border border-hairline text-transparent flex items-center justify-center">
                                •
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Company Profile Settings & Logo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-hairline">
                
                {/* Left side: Avatar details */}
                <div className="rounded-lg border border-hairline bg-surface-card p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Company Logo</span>
                  
                  <div className="relative group shrink-0">
                    {currentCompany.avatarId ? (
                      <Image 
                        src={getAvatarPreview(currentCompany.avatarId)} 
                        alt={currentCompany.name} 
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover border-2 border-hairline-strong shadow-sm"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-canvas-soft border-2 border-dashed border-hairline-strong text-ink text-xl font-bold flex items-center justify-center">
                        {currentCompany.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full pt-2">
                    <label className="cursor-pointer rounded border border-hairline-strong bg-canvas hover:bg-surface-strong px-3 py-1.5 text-xs font-bold text-ink text-center transition duration-150 shadow-sm block">
                      Change Logo
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleUploadNewAvatar}
                        className="hidden"
                      />
                    </label>
                    
                    {currentCompany.avatarId && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side: settings details */}
                <div className="rounded-lg border border-hairline bg-surface-card p-6 md:col-span-2 space-y-6">
                  <div className="border-b border-hairline-soft pb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink">Company Settings</h3>
                    <p className="text-[11px] text-muted mt-0.5">Edit credentials category templates and document profiles</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Company Name</label>
                      <input 
                        type="text"
                        required
                        value={editCompanyName}
                        onChange={(e) => setEditCompanyName(e.target.value)}
                        className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                      />
                    </div>
                    
                    <div className="rounded border border-hairline bg-canvas-soft p-4 font-mono text-xs text-muted flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span>company_id:</span>
                        <span className="text-ink text-[11px] break-all max-w-[200px] select-all font-semibold">{currentCompany.$id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>created_at:</span>
                        <span className="text-ink font-semibold">{new Date(currentCompany.createdAt).toISOString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>status:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            currentCompany.status === 'active' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-surface-strong text-muted border-hairline'
                          }`}>
                            {currentCompany.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(currentCompany)}
                            className="text-[10px] text-primary hover:underline hover:text-primary-active transition"
                          >
                            (toggle)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-hairline-soft">
                      <button 
                        type="submit"
                        disabled={isSavingSettings}
                        className="rounded border border-hairline-strong bg-canvas hover:bg-surface-strong px-5 py-2 font-bold text-ink transition duration-150 disabled:opacity-50 shadow-sm"
                      >
                        {isSavingSettings ? "Saving..." : "Save Properties"}
                      </button>

                      <button 
                        type="button"
                        onClick={handleDeleteCompany}
                        disabled={isDeletingCompany}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-650 transition disabled:opacity-50"
                      >
                        {isDeletingCompany ? "Deleting..." : "Delete Company"}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD COMPANY */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
          <div className="w-full max-w-sm mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Add New Company</h3>
              <button 
                onClick={() => { setShowAddCompany(false); setNewCompanyName(""); setNewCompanyFile(null); }}
                className="text-muted hover:text-ink p-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Company Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Acme Marketing"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1.5">Avatar / Logo (Optional)</label>
                <label className="cursor-pointer flex items-center justify-center rounded-md border border-dashed border-hairline-strong bg-canvas-soft hover:bg-surface-strong px-4 py-3 text-xs text-muted hover:text-ink transition duration-150">
                  {newCompanyFile ? newCompanyFile.name : "Select Image File"}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewCompanyFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <button 
                type="submit"
                disabled={isCreatingCompany}
                className="w-full rounded-md bg-primary text-white font-medium text-xs py-2.5 hover:bg-primary-active transition duration-150 disabled:opacity-50 shadow-sm"
              >
                {isCreatingCompany ? "Creating..." : "Create Company"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
          <div className="w-full max-w-sm mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Add Custom Category</h3>
              <button 
                onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
                className="text-muted hover:text-ink p-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Category Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Hosting & Servers"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full rounded-md bg-primary text-white font-medium text-xs py-2.5 hover:bg-primary-active transition duration-150 shadow-sm"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY */}
      {showEditCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
          <div className="w-full max-w-sm mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Edit Category</h3>
              <button 
                onClick={() => { setShowEditCategory(false); setEditCategoryName(""); }}
                className="text-muted hover:text-ink p-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Category Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Hosting & Servers"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-hairline-soft">
                <button 
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={isDeletingCategory}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition disabled:opacity-50"
                >
                  {isDeletingCategory ? "Deleting..." : "Delete Category"}
                </button>

                <button 
                  type="submit"
                  disabled={isSavingCategory}
                  className="rounded-md bg-primary text-white font-medium text-xs py-2.5 hover:bg-primary-active transition duration-150 disabled:opacity-50 shadow-sm"
                >
                  {isSavingCategory ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PLATFORM */}
      {showAddPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
          <div className="w-full max-w-sm mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Add Platform to {activeCategory}</h3>
              <button 
                onClick={() => { setShowAddPlatform(false); setNewPlatformName(""); }}
                className="text-muted hover:text-ink p-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddPlatform} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Platform/Service Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. AWS, Mailchimp, GoDaddy"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1.5">Choose Icon</label>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 rounded-md border border-hairline bg-canvas-soft">
                  {/* Monogram option (default fallback) */}
                  <button
                    type="button"
                    onClick={() => setSelectedIcon("monogram")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${
                      selectedIcon === "monogram"
                        ? "border-primary bg-surface-strong shadow-xs text-primary animate-scaleIn"
                        : "border-transparent hover:bg-surface-strong/50 text-muted"
                    }`}
                    title="Automatic Monogram"
                  >
                    <div className="h-5 w-5 rounded bg-surface-strong flex items-center justify-center font-bold text-[9px] text-ink shrink-0 border border-hairline">
                      {newPlatformName ? newPlatformName.slice(0, 1).toUpperCase() : "A"}
                    </div>
                    <span className="text-[8px] mt-1 truncate max-w-full">Auto</span>
                  </button>

                  {/* Icon options */}
                  {(activeCategory?.toLowerCase().trim() === "social media"
                    ? ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok", "whatsapp"]
                    : ["google", "outlook", "aws", "godaddy", "vercel", "netlify", "cloudflare", "gcp", "azure", "digitalocean", "mailchimp", "github", "stripe", "shopify", "figma", "canva", "slack", "discord", "wordpress"]
                  ).map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${
                        selectedIcon === iconName
                          ? "border-primary bg-surface-strong shadow-xs text-primary animate-scaleIn"
                          : "border-transparent hover:bg-surface-strong/50 text-muted"
                      }`}
                      title={iconName}
                    >
                      <div className="h-5 w-5 flex items-center justify-center shrink-0">
                        {Icons[iconName] ? Icons[iconName]() : null}
                      </div>
                      <span className="text-[8px] mt-1 capitalize truncate max-w-full">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full rounded-md bg-primary text-white font-medium text-xs py-2.5 hover:bg-primary-active transition duration-150 shadow-sm"
              >
                Add Platform
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREDENTIAL DETAILS */}
      {showCredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 backdrop-blur-xs">
          <div className="w-full max-w-md mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl">
            <div className="flex items-center justify-between mb-5 border-b border-hairline-soft pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-canvas-soft flex items-center justify-center shrink-0 border border-hairline">
                  {getIcon(activePlatform, activeCategory, platforms.find(p => p.name === activePlatform)?.icon)}
                </div>
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  {showPlatformSettings ? `Settings: ${activePlatform}` : `${activePlatform} Access`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlatformSettings(!showPlatformSettings)}
                  className={`p-1.5 rounded hover:bg-surface-strong transition duration-150 ${showPlatformSettings ? "text-primary bg-surface-strong/55" : "text-muted hover:text-ink"}`}
                  title="Platform Settings"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => { setShowCredModal(false); setShowPlatformSettings(false); }}
                  className="text-muted hover:text-ink p-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {showPlatformSettings ? (
              <form onSubmit={handleUpdatePlatformSettings} className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Platform Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. AWS, Vercel"
                    value={editPlatformName}
                    onChange={(e) => setEditPlatformName(e.target.value)}
                    className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1.5">Choose Icon</label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 rounded-md border border-hairline bg-canvas-soft">
                    {/* Monogram option */}
                    <button
                      key="monogram"
                      type="button"
                      onClick={() => setSelectedIcon("monogram")}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${
                        selectedIcon === "monogram"
                          ? "border-primary bg-surface-strong shadow-xs text-primary animate-scaleIn"
                          : "border-transparent hover:bg-surface-strong/50 text-muted"
                      }`}
                      title="Automatic Monogram"
                    >
                      <div className="h-5 w-5 rounded bg-surface-strong flex items-center justify-center font-bold text-[9px] text-ink shrink-0 border border-hairline">
                        {editPlatformName ? editPlatformName.slice(0, 1).toUpperCase() : "A"}
                      </div>
                      <span className="text-[8px] mt-1 truncate max-w-full">Auto</span>
                    </button>

                    {/* Icon options */}
                    {(activeCategory?.toLowerCase().trim() === "social media"
                      ? ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok", "whatsapp"]
                      : ["google", "outlook", "aws", "godaddy", "vercel", "netlify", "cloudflare", "gcp", "azure", "digitalocean", "mailchimp", "github", "stripe", "shopify", "figma", "canva", "slack", "discord", "wordpress"]
                    ).map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition ${
                          selectedIcon === iconName
                            ? "border-primary bg-surface-strong shadow-xs text-primary animate-scaleIn"
                            : "border-transparent hover:bg-surface-strong/50 text-muted"
                        }`}
                        title={iconName}
                      >
                        <div className="h-5 w-5 flex items-center justify-center shrink-0">
                          {Icons[iconName] ? Icons[iconName]() : null}
                        </div>
                        <span className="text-[8px] mt-1 capitalize truncate max-w-full">{iconName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-hairline-soft">
                  <button
                    type="button"
                    onClick={handleDeletePlatform}
                    disabled={isDeletingPlatform}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 transition disabled:opacity-50"
                  >
                    {isDeletingPlatform ? "Deleting..." : "Delete Platform"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPlatformSettings(false)}
                      className="rounded border border-hairline bg-canvas hover:bg-surface-strong px-4 py-2 text-xs font-medium text-ink transition duration-150 shadow-sm"
                    >
                      Back
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isSavingPlatform}
                      className="rounded-md bg-primary hover:bg-primary-active px-5 py-2 text-xs font-medium text-white transition duration-150 disabled:opacity-50 shadow-sm"
                    >
                      {isSavingPlatform ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </div>
              </form>
            ) : !isEditingCred ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Username Field */}
                <div className="flex flex-col gap-1.5 p-3 rounded-md border border-hairline bg-canvas-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Username / Email</span>
                    {credUsername && (
                      <button
                        type="button"
                        onClick={() => handleCopy(credUsername, "Username")}
                        className="text-[10px] text-primary hover:underline font-bold transition"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-ink font-mono break-all">{credUsername || "—"}</span>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5 p-3 rounded-md border border-hairline bg-canvas-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Password</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-muted hover:text-ink font-bold transition"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      {credPassword && (
                        <button
                          type="button"
                          onClick={() => handleCopy(credPassword, "Password")}
                          className="text-[10px] text-primary hover:underline font-bold transition"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-ink font-mono tracking-wide">
                    {showPassword ? credPassword : "••••••••"}
                  </span>
                </div>

                {/* Optional Fields */}
                {(credCustomerId || credExpirationDate || credPin) && (
                  <div className="border-t border-hairline-soft pt-3 mt-2 space-y-3">
                    <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider">Details</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {credCustomerId && (
                        <div className="flex flex-col gap-1.5 p-2.5 rounded border border-hairline bg-canvas-soft">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-muted-soft uppercase">Customer ID</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(credCustomerId, "Customer ID")}
                              className="text-[9px] text-primary hover:underline font-bold transition"
                            >
                              Copy
                            </button>
                          </div>
                          <span className="text-xs text-ink font-mono truncate">{credCustomerId}</span>
                        </div>
                      )}

                      {credExpirationDate && (
                        <div className="flex flex-col gap-1.5 p-2.5 rounded border border-hairline bg-canvas-soft">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-muted-soft uppercase">Expiration Date</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(credExpirationDate, "Expiration Date")}
                              className="text-[9px] text-primary hover:underline font-bold transition"
                            >
                              Copy
                            </button>
                          </div>
                          <span className="text-xs text-ink font-mono truncate">{credExpirationDate}</span>
                        </div>
                      )}

                      {credPin && (
                        <div className="flex flex-col gap-1.5 p-2.5 rounded border border-hairline bg-canvas-soft">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-muted-soft uppercase">PIN</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(credPin, "PIN")}
                              className="text-[9px] text-primary hover:underline font-bold transition"
                            >
                              Copy
                            </button>
                          </div>
                          <span className="text-xs text-ink font-mono truncate">{credPin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Button */}
                <div className="flex items-center justify-between pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setIsEditingCred(true)}
                    className="w-full rounded-md bg-primary hover:bg-primary-active px-5 py-2.5 text-xs font-bold text-white transition duration-150 shadow-sm text-center cursor-pointer"
                  >
                    Edit Credentials
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveCred} className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Username / Email</label>
                  <input 
                    type="text"
                    placeholder="admin@company.com"
                    value={credUsername}
                    onChange={(e) => setCredUsername(e.target.value)}
                    className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Password</label>
                  <div className="relative mt-1.5">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={credPassword}
                      onChange={(e) => setCredPassword(e.target.value)}
                      className="block w-full rounded-md border border-hairline bg-canvas-soft pl-3 pr-10 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink text-xs font-bold transition"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Optional Fields Toggle Accordion */}
                <div className="pt-2">
                  {showOptionalFields ? (
                    <div className="space-y-4 border-t border-hairline-soft pt-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Optional Details</span>
                        <button
                          type="button"
                          onClick={() => setShowOptionalFields(false)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold transition"
                        >
                          Hide Optional Details
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Customer ID</label>
                        <input 
                          type="text"
                          placeholder="e.g. CUST-12345"
                          value={credCustomerId}
                          onChange={(e) => setCredCustomerId(e.target.value)}
                          className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Expiration Date</label>
                        <input 
                          type="text"
                          placeholder="MM/YY or YYYY-MM-DD"
                          value={credExpirationDate}
                          onChange={(e) => setCredExpirationDate(e.target.value)}
                          className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">PIN</label>
                        <input 
                          type="text"
                          placeholder="e.g. 1234"
                          value={credPin}
                          onChange={(e) => setCredPin(e.target.value)}
                          className="mt-1.5 block w-full rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder-muted-soft transition focus:border-hairline-strong focus:bg-surface-card focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowOptionalFields(true)}
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-active font-semibold transition"
                    >
                      + Add Optional Details (Customer ID, Expiration Date, PIN)
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-hairline-soft">
                  {/* Delete/Clear credentials button */}
                  {credentials.some(c => c.category === activeCategory && c.platform === activePlatform) ? (
                    <button
                      type="button"
                      onClick={handleClearCred}
                      disabled={isClearingCred}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 transition disabled:opacity-50"
                    >
                      {isClearingCred ? "Clearing..." : "Clear Access"}
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    {/* Add Cancel button to return to View Mode if credentials already exist */}
                    {credentials.some(c => c.category === activeCategory && c.platform === activePlatform) && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCred(false);
                          setShowPassword(false);
                        }}
                        className="rounded border border-hairline bg-canvas hover:bg-surface-strong px-4 py-2 text-xs font-medium text-ink transition duration-150 shadow-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSavingCred}
                      className="rounded-md bg-primary hover:bg-primary-active px-5 py-2 text-xs font-medium text-white transition duration-150 disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {isSavingCred ? "Saving..." : "Save Credentials"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-lg border border-hairline bg-surface-card p-4 text-xs text-ink shadow-lg animate-slideUp">
          <div className={`h-2 w-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))} 
            className="ml-3 text-muted hover:text-ink font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL POPUP */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
          <div className="w-full max-w-sm mx-4 rounded-lg bg-surface-card p-6 border border-hairline animate-slideUp shadow-xl space-y-5">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{confirmModal.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{confirmModal.message}</p>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline-soft">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="rounded border border-hairline-strong bg-canvas hover:bg-surface-strong px-4 py-2 text-xs font-medium text-ink transition duration-150 shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                onClick={confirmModal.onConfirm}
                className={`rounded-md px-4 py-2 text-xs font-medium text-white transition duration-150 shadow-sm cursor-pointer ${
                  ["Delete", "Remove", "Clear"].includes(confirmModal.actionLabel)
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-primary hover:bg-primary-active"
                }`}
              >
                {confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
