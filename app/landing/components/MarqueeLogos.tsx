import { cn } from '@/lib/utils'
import Marquee from '@/components/ui/marquee'
import Image from 'next/image'

const reviews = [
  { img: '/icons/aws.webp' },
  { img: '/icons/mercado_pago.webp' },
  { img: '/icons/strapi.webp' },
  { img: '/icons/ts.webp' },
  { img: '/icons/nextjs.webp' },
  { img: '/icons/react.webp' },
]

const firstRow = reviews.slice(0, reviews.length)

const ReviewCard = ({ img }: { img: string; name?: string; username?: string; body?: string }) => {
  return (
    <figure
      className={cn(
        'relative h-full w-40 sm:w-64 overflow-hidden p-0',
        'border-gray-950/[.1] bg-gray-950/[.01]',
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]'
      )}
    >
      <div className="flex flex-row items-center gap-1 sm:gap-2">
        <div className="relative w-14 h-14 sm:w-20 sm:h-20">
          <Image src={img} alt={img} fill className="object-cover" />
        </div>
      </div>
    </figure>
  )
}

export function MarqueeLogos() {
  return (
    <>
      <h2 className="mb-4 text-base md:text-xl font-normal text-center text-gray-800">
        Forjando el futuro con tecnologías de vanguardia
      </h2>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map(review => (
            <ReviewCard key={review.img} {...review} />
          ))}
        </Marquee>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
      </div>
    </>
  )
}
