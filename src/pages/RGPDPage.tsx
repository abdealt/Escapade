export const RGPDPage = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">RGPD - Protection des Données</h1>
          
          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Responsable du traitement</h2>
              <p>
                Escapade est le responsable du traitement de vos données personnelles.
                Nous nous engageons à protéger votre vie privée conformément au Règlement Général
                sur la Protection des Données (RGPD).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Données personnelles collectées</h2>
              <p>
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Informations d'identification (nom, prénom, email)</li>
                <li>Données de connexion et d'utilisation</li>
                <li>Informations relatives aux voyages</li>
                <li>Communications avec le service client</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Base légale du traitement</h2>
              <p>
                Nous traitons vos données sur les bases légales suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Votre consentement explicite</li>
                <li>L'exécution du contrat de service</li>
                <li>Nos obligations légales</li>
                <li>Notre intérêt légitime</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Durée de conservation</h2>
              <p>
                Nous conservons vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pendant la durée de votre utilisation du service</li>
                <li>Selon les obligations légales applicables</li>
                <li>Jusqu'à l'exercice de votre droit à l'effacement</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Vos droits RGPD</h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition</li>
                <li>Droit de retirer votre consentement</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement des données</li>
                <li>Contrôle d'accès strict</li>
                <li>Formation de notre personnel</li>
                <li>Audits réguliers de sécurité</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Transferts de données</h2>
              <p>
                Si vos données sont transférées hors de l'UE, nous nous assurons que ces transferts
                sont encadrés par des garanties appropriées conformément au RGPD.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Contact DPO</h2>
              <p>
                Pour toute question concernant le traitement de vos données personnelles,
                vous pouvez contacter notre Délégué à la Protection des Données (DPO)
                via notre formulaire de contact.
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
