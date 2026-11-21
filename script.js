(() => {
      const form = document.getElementById('bookingForm');
      const nameInput = document.getElementById('visitorName');
      const dateInput = document.getElementById('visitDate');
      const quantityInput = document.getElementById('quantity');
      const categorySelect = document.getElementById('category');
      const passSelect = document.getElementById('pass');
      const foodInput = document.getElementById('food');
      const totalAmount = document.getElementById('totalAmount');
      const totalBreakdown = document.getElementById('totalBreakdown');
      const confirmation = document.getElementById('confirmation');

      // Use the visitor's local date rather than UTC so the minimum date is correct worldwide.
      const localToday = new Date();
      localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
      dateInput.min = localToday.toISOString().slice(0, 10);
      document.getElementById('year').textContent = new Date().getFullYear();

      const money = value => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
      }).format(value);

      function getBookingTotal() {
        const quantity = Number(quantityInput.value);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;
        const ticketPrice = Number(categorySelect.value);
        const passPrice = Number(passSelect.value);
        const foodPrice = foodInput.checked ? 200 : 0;
        return {
          quantity,
          ticketPrice,
          passPrice,
          foodPrice,
          total: (ticketPrice + passPrice + foodPrice) * quantity
        };
      }

      function updateTotal() {
        const booking = getBookingTotal();
        if (!booking) {
          totalAmount.textContent = '—';
          totalBreakdown.textContent = 'Choose between 1 and 20 tickets';
          return null;
        }
        totalAmount.textContent = money(booking.total);
        const passName = passSelect.options[passSelect.selectedIndex].text.split(' — ')[0];
        totalBreakdown.textContent = `${booking.quantity} ${booking.quantity === 1 ? 'ticket' : 'tickets'} · ${passName}${foodInput.checked ? ' · Food combo' : ''}`;
        return booking;
      }

      [quantityInput, categorySelect, passSelect, foodInput].forEach(control => {
        control.addEventListener('input', () => {
          quantityInput.setCustomValidity('');
          confirmation.classList.remove('visible');
          updateTotal();
        });
        control.addEventListener('change', updateTotal);
      });
      nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
      dateInput.addEventListener('change', () => confirmation.classList.remove('visible'));

      form.addEventListener('submit', event => {
        event.preventDefault();
        confirmation.classList.remove('visible');

        if (!form.reportValidity()) return;
        const booking = updateTotal();
        if (!booking) {
          quantityInput.setCustomValidity('Please choose between 1 and 20 tickets.');
          quantityInput.reportValidity();
          quantityInput.setCustomValidity('');
          return;
        }

        const visitor = nameInput.value.trim();
        if (!visitor) {
          nameInput.setCustomValidity('Please enter your name.');
          nameInput.reportValidity();
          nameInput.setCustomValidity('');
          return;
        }

        const reference = 'CQ' + Math.floor(100000 + Math.random() * 900000);
        const passName = passSelect.options[passSelect.selectedIndex].text.split(' — ')[0];

        // Build the confirmation with text nodes so visitor input is never interpreted as HTML.
        const heading = document.createElement('h4');
        heading.textContent = 'Your cosmic plan is ready!';
        const details = [
          `Visitor: ${visitor}`,
          `Visit date: ${new Date(dateInput.value + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          `Tickets: ${booking.quantity}`,
          `Pass: ${passName}`,
          `Food combo: ${foodInput.checked ? 'Added' : 'Not added'}`,
          `Estimated total: ${money(booking.total)}`,
          `Demo reference: ${reference}`
        ];
        confirmation.replaceChildren(heading);
        details.forEach(detail => {
          const line = document.createElement('p');
          line.textContent = detail;
          confirmation.appendChild(line);
        });
        const note = document.createElement('p');
        note.textContent = 'Demo confirmation only. No actual ticket has been issued.';
        note.style.color = '#8effd0';
        confirmation.appendChild(note);
        confirmation.classList.add('visible');
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      // Mobile navigation
      const menuButton = document.querySelector('.menu-toggle');
      const navigation = document.getElementById('primary-navigation');
      menuButton.addEventListener('click', () => {
        const isOpen = navigation.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        menuButton.textContent = isOpen ? '✕' : '☰';
      });
      function closeNavigation() {
        navigation.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        menuButton.textContent = '☰';
      }
      navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        closeNavigation();
      }));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeNavigation();
      });
      document.addEventListener('click', event => {
        if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeNavigation();
      });

      // Subtle scroll reveals, with a no-motion fallback for older browsers.
      const revealItems = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        revealItems.forEach(item => observer.observe(item));
      } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
      }

      const backTop = document.querySelector('.back-top');
      window.addEventListener('scroll', () => backTop.classList.toggle('show', window.scrollY > 600), { passive: true });
      updateTotal();
    })();
