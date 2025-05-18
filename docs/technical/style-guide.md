# Guia de Estilo - AliTools B2B

## Visão Geral

Este guia de estilo define os padrões visuais e de código para o desenvolvimento frontend do AliTools B2B. Ele garante consistência em toda a aplicação e facilita a manutenção do código.

## Cores

### Cores Primárias

- Azul Principal: `#1976D2`
- Azul Escuro: `#1565C0`
- Azul Claro: `#42A5F5`

### Cores de Feedback

- Sucesso: `#4CAF50`
- Aviso: `#FFC107`
- Erro: `#F44336`
- Informação: `#2196F3`

### Tons de Cinza

- Texto Principal: `#212121`
- Texto Secundário: `#757575`
- Borda: `#E0E0E0`
- Fundo: `#F5F5F5`

## Tipografia

### Família de Fonte

- Principal: `'Roboto', sans-serif`
- Código: `'Roboto Mono', monospace`

### Tamanhos de Fonte

- H1: `2.5rem`
- H2: `2rem`
- H3: `1.75rem`
- H4: `1.5rem`
- H5: `1.25rem`
- H6: `1rem`
- Corpo: `1rem`
- Pequeno: `0.875rem`

### Pesos de Fonte

- Regular: `400`
- Médio: `500`
- Negrito: `700`

## Espaçamento

### Tamanhos Base

- `4px` (0.25rem)
- `8px` (0.5rem)
- `16px` (1rem)
- `24px` (1.5rem)
- `32px` (2rem)
- `48px` (3rem)
- `64px` (4rem)

### Padding e Margin

- Pequeno: `8px`
- Médio: `16px`
- Grande: `24px`
- Extra Grande: `32px`

## Sombras

```css
/* Sombra baixa */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

/* Sombra média */
box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);

/* Sombra alta */
box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
```

## Botões

### Botão Primário
```jsx
<Button 
  variant="contained" 
  color="primary"
  size="large"
  startIcon={<Icon />}
  fullWidth
>
  Texto do Botão
</Button>
```

### Botão Secundário
```jsx
<Button 
  variant="outlined" 
  color="primary"
  size="medium"
  startIcon={<Icon />}
>
  Texto do Botão
</Button>
```

### Botão de Texto
```jsx
<Button 
  color="primary"
  size="small"
  startIcon={<Icon />}
>
  Texto do Botão
</Button>
```

## Formulários

### Campos de Entrada
```jsx
<TextField
  fullWidth
  label="Nome"
  variant="outlined"
  margin="normal"
  required
  error={!!errors.name}
  helperText={errors.name}
  {...field}
/>
```

### Seletores
```jsx
<FormControl fullWidth variant="outlined" margin="normal">
  <InputLabel id="status-label">Status</InputLabel>
  <Select
    labelId="status-label"
    label="Status"
    {...field}
  >
    <MenuItem value="pending">Pendente</MenuItem>
    <MenuItem value="processing">Processando</MenuItem>
    <MenuItem value="completed">Concluído</MenuItem>
  </Select>
</FormControl>
```

### Checkboxes e Radios
```jsx
<FormControlLabel
  control={
    <Checkbox
      checked={value}
      onChange={handleChange}
      color="primary"
    />
  }
  label="Aceito os termos e condições"
/>
```

## Cards

### Card Básico
```jsx
<Card>
  <CardHeader
    title="Título do Card"
    subheader="Subtítulo"
    action={
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    }
  />
  <CardContent>
    <Typography variant="body2">
      Conteúdo do card aqui.
    </Typography>
  </CardContent>
  <CardActions>
    <Button size="small" color="primary">
      Ação 1
    </Button>
    <Button size="small" color="primary">
      Ação 2
    </Button>
  </CardActions>
</Card>
```

## Tabelas

### Tabela Básica
```jsx
<TableContainer component={Paper}>
  <Table aria-label="Lista de produtos">
    <TableHead>
      <TableRow>
        <TableCell>Nome</TableCell>
        <TableCell align="right">Quantidade</TableCell>
        <TableCell align="right">Preço</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell align="right">{row.quantity}</TableCell>
          <TableCell align="right">{row.price}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

## Alertas e Notificações

### Snackbar
```jsx
<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  message="Operação realizada com sucesso!"
  action={
    <IconButton size="small" color="inherit" onClick={handleClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  }
/>
```

### Alertas
```jsx
<Alert 
  severity="error" 
  action={
    <IconButton
      aria-label="fechar"
      color="inherit"
      size="small"
      onClick={handleClose}
    >
      <CloseIcon fontSize="inherit" />
    </IconButton>
  }
>
  Mensagem de erro aqui.
</Alert>
```

## Navegação

### Menu Lateral
```jsx
<Drawer variant="permanent">
  <Toolbar />
  <List>
    <ListItem button>
      <ListItemIcon><DashboardIcon /></ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button>
      <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
      <ListItemText primary="Pedidos" />
    </ListItem>
  </List>
</Drawer>
```

## Responsividade

### Breakpoints

- xs: 0px
- sm: 600px
- md: 960px
- lg: 1280px
- xl: 1920px

### Exemplo de Uso

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Conteúdo 1</Paper>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Paper>Conteúdo 2</Paper>
  </Grid>
  <Grid item xs={12} md={4}>
    <Paper>Conteúdo 3</Paper>
  </Grid>
</Grid>
```

## Animações

### Transições Suaves

```css
.transition {
  transition: all 0.3s ease-in-out;
}

.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

## Ícones

### Uso de Ícones

```jsx
import {
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

<HomeIcon color="primary" fontSize="large" />
```

## Convenções de Código

### Nomenclatura

- Componentes: `PascalCase` (ex: `UserProfile.jsx`)
- Arquivos: `kebab-case` (ex: `user-profile.jsx`)
- Variáveis e funções: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### Estrutura de Componentes

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const MyComponent = ({ title, children }) => {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default MyComponent;
```

## Documentação de Componentes

### Exemplo de Documentação

```jsx
/**
 * Botão personalizado com ícone
 * 
 * @component
 * @example
 * <CustomButton 
 *   icon={<AddIcon />}
 *   onClick={() => {}}
 *   disabled={false}
 * >
 *   Adicionar Item
 * </CustomButton>
 */
const CustomButton = ({ icon, children, ...props }) => (
  <Button startIcon={icon} {...props}>
    {children}
  </Button>
);
```

## Acessibilidade

### ARIA

- Sempre use `aria-label` em botões de ícone
- Forneça `alt` para imagens
- Use `role` apropriadamente

### Teclado

- Garanta que todos os controles sejam acessíveis por teclado
- Implemente foco visível
- Forneça atalhos de teclado para ações comuns

## Performance

### Otimizações

- Use `React.memo` para componentes puros
- Implemente `useCallback` e `useMemo` quando apropriado
- Carregue componentes dinamicamente com `React.lazy`

### Imagens

- Use formatos modernos (WebP, AVIF)
- Forneça tamanhos adequados para diferentes breakpoints
- Use lazy loading para imagens fora da tela

## Internacionalização (i18n)

### Estrutura de Arquivos

```
/src/
  /i18n/
    /locales/
      en.json
      pt-BR.json
    i18n.js
```

### Uso

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('welcome')}</h1>;
}
```

## Testes

### Testes Unitários

```jsx
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Convenções de Commit

### Formato

```
tipo(escopo): mensagem descritiva

Corpo detalhado (se necessário)

[rodapé opcional]
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc.
- `refactor`: Refatoração de código
- `test`: Adicionando testes
- `chore`: Atualização de tarefas, configuração, etc.

## Checklist de Revisão de Código

### Geral

- [ ] O código segue as convenções de estilo?
- [ ] Os testes estão passando?
- [ ] A documentação foi atualizada?
- [ ] As alterações são compatíveis com versões anteriores?

### Segurança

- [ ] As entradas do usuário são validadas?
- [ ] As credenciais estão seguras?
- [ ] As dependências estão atualizadas?

### Performance

- [ ] Há gargalos de desempenho?
- [ ] As imagens estão otimizadas?
- [ ] O código está usando memoização quando apropriado?
- [ ] Os recursos estáticos estão otimizados?
