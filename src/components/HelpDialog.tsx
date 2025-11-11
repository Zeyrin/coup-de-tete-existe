"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Star5 from "@/components/icons/Star5"

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="absolute -top-6 -left-6 z-10 group">
          <div className="relative w-16 h-16">
            <Star5
              color="#FFE951"
              stroke="#000000"
              strokeWidth={3}
              className="w-full h-full transition-transform duration-150 group-hover:scale-110"
            />
            <span className="absolute inset-0 flex items-center justify-center text-black font-bold text-2xl">
              ?
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white neo-border max-w-lg p-0 gap-0 rounded-md overflow-hidden">
        <DialogHeader className="bg-[#FFE951] neo-border p-6 -m-[3px] -mb-0 rounded-t-md">
          <DialogTitle className="text-2xl font-bold uppercase text-center">
            ❓ Comment ça marche ?
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-[#FF6B6B] neo-border w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0 rounded-md">
                1
              </div>
              <h3 className="font-bold text-lg uppercase">Choisis ton départ</h3>
            </div>
            <p className="text-base pl-[52px]">
              Sélectionne ta ville de départ : <strong>Paris</strong> ou <strong>Nice</strong>
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-[#4ECDC4] neo-border w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0 rounded-md">
                2
              </div>
              <h3 className="font-bold text-lg uppercase">Définis tes limites</h3>
            </div>
            <p className="text-base pl-[52px]">
              Choisis ton <strong>temps de trajet max</strong> et ton <strong>budget max</strong>
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFE951] neo-border w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0 rounded-md">
                3
              </div>
              <h3 className="font-bold text-lg uppercase">Lance la roue !</h3>
            </div>
            <p className="text-base pl-[52px]">
              Clique sur <strong>LANCE LA ROUE</strong> et découvre ta destination surprise !
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-[#98D8C8] neo-border w-10 h-10 flex items-center justify-center font-bold text-xl flex-shrink-0 rounded-md">
                4
              </div>
              <h3 className="font-bold text-lg uppercase">Réserve ton billet</h3>
            </div>
            <p className="text-base pl-[52px]">
              Copie le nom de la gare et réserve ton billet sur <strong>SNCF Connect</strong>
            </p>
          </div>

          {/* Info box */}
          <div className="bg-[#FF6B6B] neo-card p-4 mt-6">
            <p className="text-center font-bold text-base">
              💡 Astuce : L&apos;algo évite de te proposer 3 fois de suite la même destination !
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
