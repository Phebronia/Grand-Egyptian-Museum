from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Hall, Artifact, ArtifactGalleryImage, Exhibition,
    TicketType, AddOn, Booking, BookingTicket, BookingAddOn,
    ContactMessage, NewsletterSubscription, UserFavorite,
    VisitPlanStop, VisitPlan,
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('date_of_birth', 'gender', 'phone_number', 'nationality', 'avatar')}),
    )
    list_display = ('username', 'email', 'nationality', 'is_staff')
    list_filter = ('gender', 'nationality', 'is_staff')


class ArtifactGalleryInline(admin.TabularInline):
    model = ArtifactGalleryImage
    extra = 1


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'era', 'hall', 'year_discovered', 'is_featured')
    list_filter = ('category', 'era', 'is_featured', 'hall')
    search_fields = ('name', 'description', 'discovered_by')
    list_editable = ('is_featured',)
    inlines = [ArtifactGalleryInline]


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('name', 'era', 'theme', 'sub_theme')
    list_filter = ('era', 'theme')
    search_fields = ('name',)


@admin.register(Exhibition)
class ExhibitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_featured', 'is_upcoming')
    list_filter = ('is_featured',)
    search_fields = ('name',)
    list_editable = ('is_featured',)

    def is_upcoming(self, obj):
        return obj.is_upcoming
    is_upcoming.boolean = True


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'nationality_category', 'visitor_category', 'price', 'is_active')
    list_filter = ('nationality_category', 'visitor_category', 'is_active')
    list_editable = ('price', 'is_active')


@admin.register(AddOn)
class AddOnAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active')
    list_editable = ('price', 'is_active')


class BookingTicketInline(admin.TabularInline):
    model = BookingTicket
    extra = 1
    readonly_fields = ('line_total',)

    def line_total(self, obj):
        return f"EGP {obj.line_total()}"


class BookingAddOnInline(admin.TabularInline):
    model = BookingAddOn
    extra = 0
    readonly_fields = ('line_total',)

    def line_total(self, obj):
        return f"EGP {obj.line_total()}"


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'visit_date', 'entry_time', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'visit_date', 'tour_language')
    search_fields = ('full_name', 'email', 'mobile')
    readonly_fields = ('created_at', 'subtotal', 'discount', 'total_amount')
    inlines = [BookingTicketInline, BookingAddOnInline]
    date_hierarchy = 'visit_date'


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'full_name', 'email', 'rating', 'is_read', 'created_at')
    list_filter = ('rating', 'is_read')
    search_fields = ('full_name', 'email', 'subject')
    readonly_fields = ('full_name', 'email', 'subject', 'message', 'rating', 'is_read', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True  # allow opening the detail view (all fields are readonly)

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('is_active',)


@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'artifact', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__username', 'artifact__name')


@admin.register(VisitPlanStop)
class VisitPlanStopAdmin(admin.ModelAdmin):
    list_display = ('label', 'suggested_minutes', 'artifact', 'hall')


@admin.register(VisitPlan)
class VisitPlanAdmin(admin.ModelAdmin):
    list_display = ('visitor_type', 'duration')
    list_filter = ('visitor_type', 'duration')
    filter_horizontal = ('stops',)
