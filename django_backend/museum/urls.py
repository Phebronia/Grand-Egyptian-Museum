from django.urls import path
from . import views

urlpatterns = [
    # Auth API
    path('api/login/', views.api_login, name='api_login'),
    path('api/signup/', views.api_signup, name='api_signup'),
    path('api/logout/', views.api_logout, name='api_logout'),

    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('about/', views.about, name='about'),

    # Explore
    path('explore/', views.explore, name='explore'),
    path('explore/artifact/<int:pk>/', views.artifact_detail, name='artifact_detail'),
    path('explore/hall/<int:pk>/', views.hall_detail, name='hall_detail'),

    # Booking
    path('booking/', views.booking_step1, name='booking_step1'),
    path('booking/step3/', views.booking_step3, name='booking_step3'),
    path('booking/step4/', views.booking_step4, name='booking_step4'),

    # Contact
    path('contact/', views.contact, name='contact'),

    # Auth
    path('auth/', views.registration, name='registration'),
    path('logout/', views.logout_view, name='logout'),

    # Profile
    path('profile/', views.profile, name='profile'),
    path('api/profile/', views.api_profile, name='api_profile'),
    path('profile/favorite/<int:artifact_pk>/', views.toggle_favorite, name='toggle_favorite'),

    # Plan Your Visit
    path('plan/', views.plan_visit, name='plan_visit'),

    # Newsletter
    path('newsletter/subscribe/', views.newsletter_subscribe, name='newsletter_subscribe'),

    # Contact API
    path('api/contact/', views.api_contact, name='api_contact'),

    # Booking API
    path('api/booking/', views.api_booking, name='api_booking'),

    # Admin stats API (staff only)
    path('api/admin-stats/', views.admin_stats, name='admin_stats'),

    # Dashboard CRUD APIs
    path('api/admin/artifacts/',        views.api_admin_artifacts,  name='api_admin_artifacts'),
    path('api/admin/artifacts/<int:pk>/', views.api_admin_artifact, name='api_admin_artifact'),
    path('api/admin/halls/',            views.api_admin_halls,      name='api_admin_halls'),
    path('api/admin/halls/<int:pk>/',   views.api_admin_hall,       name='api_admin_hall'),
    path('api/admin/messages/',           views.api_admin_messages,   name='api_admin_messages'),
    path('api/admin/messages/<int:pk>/', views.api_admin_message,    name='api_admin_message'),
    path('api/admin/users/',            views.api_admin_users,      name='api_admin_users'),
    path('api/admin/users/<int:pk>/',   views.api_admin_user,       name='api_admin_user'),
    path('api/admin/bookings/',           views.api_admin_bookings,    name='api_admin_bookings'),
    path('api/admin/bookings/<int:pk>/',  views.api_admin_booking,     name='api_admin_booking'),

    # Exhibitions
    path('api/admin/exhibitions/',          views.api_admin_exhibitions, name='api_admin_exhibitions'),
    path('api/admin/exhibitions/<int:pk>/', views.api_admin_exhibition,  name='api_admin_exhibition'),

    # Ticket Types
    path('api/admin/tickets/',          views.api_admin_tickets, name='api_admin_tickets'),
    path('api/admin/tickets/<int:pk>/', views.api_admin_ticket,  name='api_admin_ticket'),

    # Add-ons
    path('api/admin/addons/',          views.api_admin_addons, name='api_admin_addons'),
    path('api/admin/addons/<int:pk>/', views.api_admin_addon,  name='api_admin_addon'),

    # Newsletter subscribers
    path('api/admin/newsletter/', views.api_admin_newsletter, name='api_admin_newsletter'),
]
