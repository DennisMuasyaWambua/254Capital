"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Facebook, Instagram, MessageCircle, Twitter } from 'lucide-react'
import Image from "next/image"

export default function ContactForm() {
  const handleSubmit = () => {}

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Image */}
            <div className="relative h-64 md:h-auto">
              <Image
                src="/manufacturing.jpg"
                alt="Car Assembly Line"
                className="object-cover rounded-t-lg md:rounded-none md:rounded-l-lg"
                fill
                priority
              />
            </div>

            {/* Right side - Form */}
            <div className="p-6">
              <h2 className="text-xl md:text-2xl font-semibold text-teal-600 mb-4 md:mb-6">
                Contact us
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Name"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Message"
                    className="w-full min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  Send
                </Button>

                {/* Social Media Icons */}
                <div className="flex justify-center gap-4 mt-6">
                  <a href="#" className="text-facebook hover:text-facebook/80">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-green-500 hover:text-green-600">
                    <MessageCircle className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-twitter hover:text-twitter/80">
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-pink-500 hover:text-pink-600">
                    <Instagram className="h-6 w-6" />
                  </a>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

