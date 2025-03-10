"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";

export function ModalNathan({ 
  title, 
  description, 
  isOpen = true,
  onClose,
  isReroute = false,
  routeLink= "",
  modalInput
}: { 
  title: string, 
  description: string,
  isOpen?: boolean,
  onClose?: () => void,
  isReroute?: boolean,
  routeLink?: string
  modalInput?: string
}) {
  if (!isOpen) return null;
  
  return (
    <CardContainer className="absolute top-[100%] left-1/2 -translate-x-1/2 +translate-y-1/2 w-full max-w-2xl px-4">
      <CardBody className="bg-white/100 backdrop-blur-sm relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black/90 dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border shadow-lg">
        <CardItem
          translateZ="50"
          className="text-3xl font-bold text-neutral-600 dark:text-white"
        >
          {title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-lg max-w-sm mt-2 dark:text-neutral-300"
        >
          {description}
        </CardItem> 
        <div className="flex justify-between items-center mt-20 cursor-pointer">
          <CardItem
            translateZ={20}
            as="button"
            className="px-4 py-3 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold hover:scale-110 transition-all duration-300 cursor-pointer"
            onClick={onClose}
          >
            Close
          </CardItem>
          {isReroute && (
            <CardItem
              translateZ={20}
              as="button"
              className="px-4 py-3 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold hover:scale-110 transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = routeLink}
            >
              Go to {routeLink}
            </CardItem>
          )}
        </div>
      </CardBody>
    </CardContainer>
  );
}
