from django.db import models
from django.contrib.auth.models import AbstractUser


# ─── Auth ────────────────────────────────────────────────────────────────────

class CustomUser(AbstractUser):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.username


# ─── Museum Structure ────────────────────────────────────────────────────────

class Hall(models.Model):
    ERA_CHOICES = [
        ('old', 'Old Kingdom'),
        ('middle', 'Middle Kingdom'),
        ('new', 'New Kingdom'),
        ('late', 'Late Period'),
        ('roman', 'Roman Period'),
    ]
    THEME_CHOICES = [
        ('society', 'Society'),
        ('royalty', 'Royalty'),
        ('beliefs', 'Beliefs'),
    ]

    name = models.CharField(max_length=200)
    era = models.CharField(max_length=20, choices=ERA_CHOICES)
    theme = models.CharField(max_length=20, choices=THEME_CHOICES)
    sub_theme = models.CharField(max_length=100, blank=True, help_text='e.g. Life, Trade, Pharaohs')
    description = models.TextField(blank=True)
    history_text = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='halls/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_era_display()})"


class ArtifactGalleryImage(models.Model):
    artifact = models.ForeignKey('Artifact', on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='artifacts/gallery/')
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for {self.artifact.name}"


class Artifact(models.Model):
    CATEGORY_CHOICES = [
        ('royal', 'Royal Artifact'),
        ('sculpture', 'Sculpture'),
        ('inscription', 'Inscription'),
        ('manuscript', 'Manuscript'),
        ('monument', 'Monument'),
        ('jewelry', 'Jewelry'),
        ('tool', 'Tool'),
        ('pottery', 'Pottery'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    hall = models.ForeignKey(Hall, on_delete=models.SET_NULL, null=True, blank=True, related_name='artifacts')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    era = models.CharField(max_length=100, blank=True, help_text='e.g. New Kingdom')
    year_discovered = models.IntegerField(null=True, blank=True)
    discovered_by = models.CharField(max_length=200, blank=True)
    material = models.CharField(max_length=200, blank=True)
    date_label = models.CharField(max_length=50, blank=True, help_text='Display date, e.g. 1323 BCE')
    description = models.TextField(blank=True)
    main_image = models.ImageField(upload_to='artifacts/', null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ─── Exhibitions ─────────────────────────────────────────────────────────────

class Exhibition(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    cover_image = models.ImageField(upload_to='exhibitions/', null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    location_in_museum = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name

    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.start_date > timezone.now().date()


# ─── Tickets & Booking ───────────────────────────────────────────────────────

class TicketType(models.Model):
    NATIONALITY_CHOICES = [('egyptian', 'Egyptian'), ('foreign', 'Foreign')]
    VISITOR_CHOICES = [('adult', 'Adult'), ('student', 'Student'), ('child', 'Child')]

    name = models.CharField(max_length=100)
    nationality_category = models.CharField(max_length=10, choices=NATIONALITY_CHOICES)
    visitor_category = models.CharField(max_length=10, choices=VISITOR_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} — EGP {self.price}"


class AddOn(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} — EGP {self.price}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    LANGUAGE_CHOICES = [
        ('arabic', 'Arabic'),
        ('english', 'English'),
        ('french', 'French'),
        ('spanish', 'Spanish'),
        ('german', 'German'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    # Contact info (stored separately so guest bookings work too)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    nationality = models.CharField(max_length=100)
    # Visit details
    visit_date = models.DateField()
    entry_time = models.TimeField()
    tour_language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='english')
    # Payment
    promo_code = models.CharField(max_length=50, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.pk} — {self.full_name} on {self.visit_date}"


class BookingTicket(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    def line_total(self):
        return self.ticket_type.price * self.quantity

    def __str__(self):
        return f"{self.quantity}× {self.ticket_type.name}"


class BookingAddOn(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='addons')
    addon = models.ForeignKey(AddOn, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    def line_total(self):
        return self.addon.price * self.quantity

    def __str__(self):
        return f"{self.quantity}× {self.addon.name}"


# ─── Contact & Feedback ──────────────────────────────────────────────────────

class ContactMessage(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.subject} — {self.full_name}"


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email


# ─── User Favorites ──────────────────────────────────────────────────────────

class UserFavorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorites')
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'artifact')

    def __str__(self):
        return f"{self.user.username} ♥ {self.artifact.name}"


# ─── Visit Plan ──────────────────────────────────────────────────────────────

class VisitPlanStop(models.Model):
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE, null=True, blank=True)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, null=True, blank=True)
    label = models.CharField(max_length=200)
    suggested_minutes = models.PositiveIntegerField(default=15)

    def __str__(self):
        return f"{self.label} ({self.suggested_minutes} min)"


class VisitPlan(models.Model):
    VISITOR_TYPE_CHOICES = [
        ('solo', 'Solo'),
        ('group', 'Group'),
        ('educational', 'Educational'),
        ('tour', 'Tour / Trip'),
    ]
    DURATION_CHOICES = [
        ('1h', '1 Hour'),
        ('2h', '2 Hours'),
        ('4h', '4 Hours'),
        ('full', 'Full Day'),
    ]

    visitor_type = models.CharField(max_length=15, choices=VISITOR_TYPE_CHOICES)
    duration = models.CharField(max_length=5, choices=DURATION_CHOICES)
    stops = models.ManyToManyField(VisitPlanStop, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_visitor_type_display()} — {self.get_duration_display()}"
