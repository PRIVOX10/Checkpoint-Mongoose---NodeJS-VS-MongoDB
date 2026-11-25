# Checkpoint — MongoDB & Mongoose

Gestion d'une base de données MongoDB Atlas avec Mongoose : création, lecture, mise à jour et suppression de documents `Person`.

## Prérequis

- Node.js
- Un cluster MongoDB Atlas (offre gratuite M0 suffisante) et son URI de connexion

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine (jamais commité) :

```
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/checkpoint?retryWrites=true&w=majority"
```

- Garder les guillemets, sans espace autour du `=`.
- Autoriser son adresse IP dans Atlas (Security → Network Access).

## Lancer

```bash
npm start
```

(`npm run dev` fait la même chose.) Le script exécute toutes les étapes à la suite et affiche chaque résultat.

## Modèle

```js
Person {
  name: String (required),
  age: Number,
  favoriteFoods: [String]
}
```

## Fonctions (dans `app.js`)

| Fonction | Méthode Mongoose | Rôle |
|---|---|---|
| `createAndSavePerson` | `new Person().save()` | Crée et enregistre une personne |
| `createManyPeople` | `Model.create()` | Crée plusieurs personnes |
| `findPeopleByName` | `Model.find()` | Toutes les personnes d'un nom donné |
| `findOneByFood` | `Model.findOne()` | Une personne aimant un plat donné |
| `findPersonById` | `Model.findById()` | Une personne par `_id` |
| `findEditThenSave` | `findById()` + `save()` | Ajoute « hamburger » aux plats favoris |
| `findAndUpdate` | `Model.findOneAndUpdate()` | Met l'âge à 20 (`{ new: true }`) |
| `removeById` | `Model.findByIdAndRemove()` | Supprime une personne par `_id` |
| `removeManyPeople` | `Model.remove()` | Supprime toutes les « Mary » |
| `queryChain` | `find().sort().limit().select().exec()` | Personnes aimant les burritos, triées par nom, 2 max, sans l'âge |

## Remarques

- Version utilisée : `mongoose@6`, car les consignes utilisent des callbacks et des méthodes retirées dans Mongoose 7 et plus (`findByIdAndRemove`, `Model.remove`).
- Les avertissements `strictQuery` et `collection.remove is deprecated` à l'exécution sont normaux avec cette version.
