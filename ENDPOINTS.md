# Guide de Test des Endpoints API (Manuel)

Ce document liste tous les endpoints disponibles pour faciliter leur test manuel dans **Thunder Client**, **Postman** ou **Insomnia**.

---

## 🔒 1. Authentification (`/auth`)

### Inscription (Register)
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/auth/register`
- **Body** (JSON) :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Connexion (Login)
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/auth/login`
- **Body** (JSON) :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
> ⚠️ **Important** : Vous recevrez un **token JWT** en réponse. Copiez-le. Pour toutes les requêtes ci-dessous, allez dans l'onglet **Auth** de Thunder Client, sélectionnez **Bearer**, et collez votre token.

---

## 👤 2. Utilisateurs (`/users`)

### Voir mon profil
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/users/profile`
- **Auth** : Bearer Token

---

## 📚 3. Catégories (`/categories`)

### Créer une catégorie
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/categories`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "name": "Science-Fiction"
}
```

### Lister les catégories
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/categories`

### Obtenir une catégorie par ID
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/categories/<id>`
*(Remplacez `<id>` dans l'URL par l'ID réel)*

### Modifier une catégorie
- **Méthode** : `PATCH`
- **URL** : `http://localhost:3000/api/v1/categories/<id>`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "name": "Fantasy"
}
```

### Supprimer une catégorie
- **Méthode** : `DELETE`
- **URL** : `http://localhost:3000/api/v1/categories/<id>`
- **Auth** : Bearer Token

---

## 📖 4. Livres (`/books`)

### Ajouter un livre
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/books`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "isbn": "978-2221245053",
  "categoryId": "<category_id>"
}
```

### Lister les livres
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/books`

### Obtenir un livre par ID
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/books/<id>`

### Modifier un livre
- **Méthode** : `PATCH`
- **URL** : `http://localhost:3000/api/v1/books/<id>`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "title": "Dune (Nouvelle Édition)"
}
```

### Supprimer un livre
- **Méthode** : `DELETE`
- **URL** : `http://localhost:3000/api/v1/books/<id>`
- **Auth** : Bearer Token

---

## 📦 5. Inventaire (`/inventory`)

### Ajouter une entrée d'inventaire
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/inventory`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "bookId": "<book_id>",
  "quantity": 10
}
```

### Lister l'inventaire
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/inventory`

### Obtenir une entrée d'inventaire par ID
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/inventory/<id>`

### Modifier une entrée d'inventaire
- **Méthode** : `PATCH`
- **URL** : `http://localhost:3000/api/v1/inventory/<id>`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "quantity": 15
}
```

### Supprimer une entrée d'inventaire
- **Méthode** : `DELETE`
- **URL** : `http://localhost:3000/api/v1/inventory/<id>`
- **Auth** : Bearer Token

---

## 🤝 6. Emprunts (`/borrowings`)

### Emprunter un livre
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/borrowings/borrow`
- **Auth** : Bearer Token
- **Body** (JSON) :
```json
{
  "inventoryId": "<inventory_id>"
}
```

### Retourner un livre
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/api/v1/borrowings/return/<borrowing_id>`
- **Auth** : Bearer Token

### Lister ses propres emprunts (My Borrowings)
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/borrowings/my`
- **Auth** : Bearer Token

---

## 📊 7. Analytiques (`/analytics`)

### Obtenir les KPIs (Key Performance Indicators)
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/analytics/kpis`
- **Auth** : Bearer Token

### Obtenir les livres les plus populaires (Top Books)
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/analytics/top-books`
- **Auth** : Bearer Token

### Obtenir le taux de retard (Overdue Rate)
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/analytics/overdue-rate`
- **Auth** : Bearer Token

---

## 🌐 8. Racine / Autre (`/`)

### Vérification de l'API (Healthcheck)
- **Méthode** : `GET`
- **URL** : `http://localhost:3000/api/v1/`
