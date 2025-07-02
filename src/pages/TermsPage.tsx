export const TermsPage = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Conditions d'Utilisation</h1>
          
          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Acceptation des conditions</h2>
              <p>
                En utilisant Escapade, vous acceptez d'être lié par les présentes conditions d'utilisation.
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Description du service</h2>
              <p>
                Escapade est une plateforme de planification de voyages permettant aux utilisateurs de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer et gérer des itinéraires de voyage</li>
                <li>Partager des plans de voyage avec d'autres utilisateurs</li>
                <li>Gérer les dépenses liées aux voyages</li>
                <li>Collaborer avec d'autres voyageurs</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Inscription et compte</h2>
              <p>
                Pour utiliser nos services, vous devez :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Créer un compte avec des informations exactes et à jour</li>
                <li>Protéger la confidentialité de vos identifiants</li>
                <li>Être responsable de toute activité sur votre compte</li>
                <li>Avoir l'âge légal dans votre juridiction</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Règles d'utilisation</h2>
              <p>
                En utilisant notre service, vous acceptez de ne pas :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violer les lois applicables</li>
                <li>Publier du contenu illégal ou offensant</li>
                <li>Usurper l'identité d'autres personnes</li>
                <li>Perturber le fonctionnement du service</li>
                <li>Collecter des informations sur d'autres utilisateurs sans autorisation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Propriété intellectuelle</h2>
              <p>
                Tout le contenu fourni par Escapade est protégé par les lois sur la propriété intellectuelle.
                Vous ne pouvez pas utiliser ce contenu sans notre autorisation expresse.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Limitation de responsabilité</h2>
              <p>
                Escapade ne peut être tenu responsable des :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dommages indirects résultant de l'utilisation du service</li>
                <li>Contenus publiés par les utilisateurs</li>
                <li>Pertes de données ou interruptions de service</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment.
                Les modifications seront effectives dès leur publication sur notre site.
              </p>
            </section>

            <div className="text-sm text-gray-400 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
