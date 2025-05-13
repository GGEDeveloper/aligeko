import * as React from "react"
import { Link } from 'react-router-dom'
import { Button } from "./button"
import { Input } from "./input"
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
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Mantenha-se Conectado</h2>
            <p className="mb-6 text-muted-foreground">
              Inscreva-se em nossa newsletter para receber as últimas atualizações e ofertas exclusivas.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Digite seu email"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Inscrever-se</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Links Rápidos</h3>
            <nav className="space-y-2 text-sm">
              <Link to="/" className="block transition-colors hover:text-primary">
                Início
              </Link>
              <Link to="/products" className="block transition-colors hover:text-primary">
                Produtos
              </Link>
              <Link to="/sobre-nos" className="block transition-colors hover:text-primary">
                Sobre Nós
              </Link>
              <Link to="/contato" className="block transition-colors hover:text-primary">
                Contato
              </Link>
              <Link to="/ajuda" className="block transition-colors hover:text-primary">
                Ajuda & Suporte
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Entre em Contato</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="mt-1 size-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-muted-foreground">
                    Rua das Ferramentas, 123<br />
                    Lisboa, 1000-000
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 size-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-muted-foreground">+351 210 000 000</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 size-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">info@alitools.pt</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-lg font-semibold">Siga-nos</h3>
            <div className="mb-6 flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="size-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="size-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="size-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Linkedin className="size-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="theme-mode" className="flex-1">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    <span>Modo {isDarkMode ? "Escuro" : "Claro"}</span>
                  </div>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Switch
                        id="theme-mode"
                        checked={isDarkMode}
                        onCheckedChange={setIsDarkMode}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        Alternar para o modo {isDarkMode ? "claro" : "escuro"}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 items-center justify-between border-t border-muted pt-8 md:flex">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Logo className="mr-3" height={30} />
              <div>
                <h2 className="text-xl font-bold">AliTools</h2>
                <p className="text-xs text-muted-foreground">Ferramentas de Qualidade</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} AliTools. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection; 