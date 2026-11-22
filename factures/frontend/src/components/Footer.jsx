import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-column footer-about">
          <h2>Auberge<span>.</span></h2>
          <p>
            Bienvenue dans notre auberge. Profitez d'un séjour confortable
            et d'une expérience authentique.
          </p>

          <div className="footer-socials">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Liens rapides</h3>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/chambres/">Chambres</a></li>
            <li><a href="/services/">Services</a></li>
            <li><a href="/factures/">Facturation</a></li>
            <li><a href="/reservations/">Réservations</a></li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h3>Réservation et contact</h3>
          <p>
            Besoin d'informations ou envie de réserver votre séjour ?
          </p>

          <a className="footer-booking" href="/reservations/">
            Réserver maintenant
          </a>

          <p className="footer-contact-info">
            <strong>Email :</strong> contact@auberge.com
          </p>
          <p className="footer-contact-info">
            <strong>Téléphone :</strong> +212 000 000 000
          </p>
        </div>
      </div>

      <div className="footer-payment">
        <span>Paiement sécurisé :</span>
        <strong>Stripe</strong>
        <strong>Visa</strong>
        <strong>Mastercard</strong>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Auberge. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;