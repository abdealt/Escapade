export const PrivacyPage = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité</h1>
          
          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Collecte des données</h2>
              <p>
                Nous collectons les informations que vous nous fournissez directement lors de :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La création de votre compte</li>
                <li>La planification de vos voyages</li>
                <li>L'utilisation de nos services de partage d'itinéraires</li>
                <li>Vos interactions avec d'autres utilisateurs</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Utilisation des données</h2>
              <p>
                Les données collectées sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Améliorer nos services et fonctionnalités</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>L'accès non autorisé</li>
                <li>La modification</li>
                <li>La divulgation ou la destruction</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Vos droits</h2>
              <p>
                Vous disposez des droits suivants concernant vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement de vos données</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Cookies</h2>
              <p>
                Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme.
                Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Contact</h2>
              <p>
                Pour toute question concernant notre politique de confidentialité,
                veuillez nous contacter via notre formulaire de contact.
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
