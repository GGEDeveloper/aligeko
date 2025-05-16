import * as React from "react"
import { Link } from 'react-router-dom'
import { Button } from "./Button"
import { Input } from "./Input"
import { Label } from "./label"
import { Switch } from "./switch"
import { Textarea } from "./textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"
import Logo from './Logo'

/**
 * Modern footer component for AliTools with dark mode toggle
 * Set to dark mode by default for brand consistency
 */
function FooterSection() {
  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const currentYear = new Date().getFullYear()

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="border-t bg-white text-gray-700">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo e marca */}
        <div className="flex items-center gap-2">
          <Logo height={28} />
          <span className="font-bold text-lg text-yellow-600">AliTools</span>
        </div>
        {/* Navegação */}
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-yellow-600 transition">Início</Link>
          <Link to="/products" className="hover:text-yellow-600 transition">Produtos</Link>
          <Link to="/sobre-nos" className="hover:text-yellow-600 transition">Sobre</Link>
          <Link to="/contato" className="hover:text-yellow-600 transition">Contato</Link>
          <Link to="/ajuda" className="hover:text-yellow-600 transition">Ajuda</Link>
        </nav>
        {/* Redes sociais */}
        <div className="flex gap-3">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-yellow-600 transition">
            <Facebook size={18} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-yellow-600 transition">
            <Instagram size={18} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-yellow-600 transition">
            <Linkedin size={18} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-yellow-600 transition">
            <Twitter size={18} />
          </a>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-2 bg-gray-50 border-t">
        &copy; {currentYear} AliTools. Todos os direitos reservados.
      </div>
    </footer>
  )
}

export default FooterSection;