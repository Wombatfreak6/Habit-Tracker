import { useState, useEffect } from 'react'

const JAPANESE_TOPICS = [
  { slug: 'Miyamoto_Musashi', category: 'Samurai' },
  { slug: 'Oda_Nobunaga', category: 'History' },
  { slug: 'Tokugawa_Ieyasu', category: 'History' },
  { slug: 'Minamoto_no_Yoshitsune', category: 'Samurai' },
  { slug: 'Japanese_crane', category: 'Wildlife' },
  { slug: 'Japanese_macaque', category: 'Wildlife' },
  { slug: 'Shogun', category: 'Culture' },
  { slug: 'Bushido', category: 'Samurai' },
  { slug: 'Ninja', category: 'Culture' },
  { slug: 'Geisha', category: 'Culture' },
  { slug: 'Shinto', category: 'Culture' },
  { slug: 'Zen', category: 'Culture' },
  { slug: 'Origami', category: 'Culture' },
  { slug: 'Sakura', category: 'Nature' },
  { slug: 'Mount_Fuji', category: 'Nature' },
  { slug: 'Ry%C5%8Dan-ji', category: 'Culture' },
  { slug: 'Ise_Grand_Shrine', category: 'Culture' },
  { slug: 'Kinkaku-ji', category: 'Culture' },
  { slug: 'Matsuri', category: 'Culture' },
  { slug: 'Amur_leopard_cat', category: 'Wildlife' },
]

export const useCulturalFact = () => {
  const [fact, setFact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const topic = JAPANESE_TOPICS[Math.floor(Math.random() * JAPANESE_TOPICS.length)]

    const fetchFact = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${topic.slug}`
        )
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        const extract = data.extract || ''
        setFact({
          title: data.title,
          body: extract.length > 180 ? extract.slice(0, 180).trimEnd() + '…' : extract,
          category: topic.category,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${topic.slug}`,
        })
      } catch (err) {
        setError(err)
        // Fallback fact
        setFact({
          title: 'Sakura',
          body: 'Cherry blossoms (sakura) are the national flower of Japan, symbolizing the fleeting beauty of life — a concept called mono no aware.',
          category: 'Nature',
          url: 'https://en.wikipedia.org/wiki/Sakura',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFact()
  }, [])

  return { fact, loading, error }
}
