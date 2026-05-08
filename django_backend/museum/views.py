import json
from collections import Counter
from datetime import datetime as _dt, time as _time
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import (
    Artifact, Hall, Exhibition, TicketType, AddOn,
    Booking, BookingTicket, UserFavorite, VisitPlan, CustomUser,
    ContactMessage, NewsletterSubscription,
)
from .forms import SignUpForm, ProfileUpdateForm, ContactForm, NewsletterForm


def _is_staff(request):
    return request.user.is_authenticated and request.user.is_staff


# ─── Auth API (JSON) ─────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def api_login(request):
    data = json.loads(request.body)
    email = data.get('email', '').strip()
    password = data.get('password', '')
    user = authenticate(request, username=email, password=password)
    if user:
        login(request, user)
        return JsonResponse({
            'ok': True,
            'user': {'name': user.get_full_name() or user.username, 'email': user.email}
        })
    return JsonResponse({'ok': False, 'error': 'Invalid email or password.'}, status=401)


@csrf_exempt
@require_POST
def api_signup(request):
    data = json.loads(request.body)
    full_name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm = data.get('confirm', '')

    if not full_name or not email or not password:
        return JsonResponse({'ok': False, 'error': 'All fields are required.'}, status=400)
    if password != confirm:
        return JsonResponse({'ok': False, 'error': 'Passwords do not match.'}, status=400)
    if len(password) < 8:
        return JsonResponse({'ok': False, 'error': 'Password must be at least 8 characters.'}, status=400)
    if CustomUser.objects.filter(username=email).exists():
        return JsonResponse({'ok': False, 'error': 'An account with this email already exists.'}, status=400)

    name_parts = full_name.split(' ', 1)
    user = CustomUser.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name_parts[0],
        last_name=name_parts[1] if len(name_parts) > 1 else '',
    )
    login(request, user)
    return JsonResponse({
        'ok': True,
        'user': {'name': user.get_full_name() or user.username, 'email': user.email}
    })


@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'ok': True})


# ─── Home ────────────────────────────────────────────────────────────────────

def home(request):
    return redirect('/static/home/home.html')


def dashboard(request):
    return redirect('/static/admin/dash.html')


# ─── About ───────────────────────────────────────────────────────────────────

def about(request):
    return render(request, 'museum/about.html')


# ─── Explore ─────────────────────────────────────────────────────────────────

def explore(request):
    era = request.GET.get('era')
    theme = request.GET.get('theme')
    query = request.GET.get('q', '')

    halls = Hall.objects.all()
    if era:
        halls = halls.filter(era=era)
    if theme:
        halls = halls.filter(theme=theme)

    artifacts = Artifact.objects.all()
    if query:
        artifacts = artifacts.filter(name__icontains=query)
    featured = Artifact.objects.filter(is_featured=True)[:4]

    return render(request, 'museum/explore.html', {
        'halls': halls,
        'artifacts': artifacts,
        'featured_artifacts': featured,
        'query': query,
        'selected_era': era,
        'selected_theme': theme,
    })


def artifact_detail(request, pk):
    artifact = get_object_or_404(Artifact, pk=pk)
    is_favorited = (
        request.user.is_authenticated
        and UserFavorite.objects.filter(user=request.user, artifact=artifact).exists()
    )
    return render(request, 'museum/artifact_detail.html', {
        'artifact': artifact,
        'is_favorited': is_favorited,
    })


def hall_detail(request, pk):
    hall = get_object_or_404(Hall, pk=pk)
    artifacts = hall.artifacts.all()
    return render(request, 'museum/hall_detail.html', {'hall': hall, 'artifacts': artifacts})


# ─── Booking ─────────────────────────────────────────────────────────────────

def booking_step1(request):
    ticket_types = TicketType.objects.filter(is_active=True)
    addons = AddOn.objects.filter(is_active=True)
    return render(request, 'museum/booking_step1.html', {
        'ticket_types': ticket_types,
        'addons': addons,
    })


def booking_step3(request):
    if request.method == 'POST':
        from .forms import BookingStep3Form
        form = BookingStep3Form(request.POST)
        if form.is_valid():
            request.session['booking_contact'] = form.cleaned_data
            return redirect('booking_step4')
    else:
        form_class = __import__('museum.forms', fromlist=['BookingStep3Form']).BookingStep3Form
        form = form_class()
    return render(request, 'museum/booking_step3.html', {'form': form})


def booking_step4(request):
    contact = request.session.get('booking_contact', {})
    ticket_types = TicketType.objects.filter(is_active=True)
    addons = AddOn.objects.filter(is_active=True)
    return render(request, 'museum/booking_step4.html', {
        'contact': contact,
        'ticket_types': ticket_types,
        'addons': addons,
    })


# ─── Contact ─────────────────────────────────────────────────────────────────

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your message has been sent. Thank you!')
            return redirect('contact')
    else:
        form = ContactForm()
    return render(request, 'museum/contact.html', {'form': form})


# ─── Auth ────────────────────────────────────────────────────────────────────

def registration(request):
    signup_form = SignUpForm()
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'signup':
            signup_form = SignUpForm(request.POST)
            if signup_form.is_valid():
                user = signup_form.save()
                login(request, user)
                return redirect('home')
        elif action == 'login':
            email = request.POST.get('email')
            password = request.POST.get('password')
            user = authenticate(request, username=email, password=password)
            if user:
                login(request, user)
                return redirect('home')
            else:
                messages.error(request, 'Invalid credentials.')
    return render(request, 'museum/registration.html', {'signup_form': signup_form})


def logout_view(request):
    logout(request)
    return redirect('home')


# ─── Profile ─────────────────────────────────────────────────────────────────

@login_required
def profile(request):
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated.')
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=request.user)
    favorites = UserFavorite.objects.filter(user=request.user).select_related('artifact')
    return render(request, 'museum/profile.html', {'form': form, 'favorites': favorites})


def _profile_payload(user):
    return {
        'fullName': user.get_full_name().strip(),
        'dob': user.date_of_birth.isoformat() if user.date_of_birth else '',
        'gender': user.get_gender_display() if user.gender else '',
        'phone': user.phone_number or '',
        'nationality': user.nationality or '',
    }


@csrf_exempt
def api_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'ok': False, 'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        return JsonResponse({'ok': True, 'profile': _profile_payload(request.user)})

    if request.method == 'POST':
        try:
            data = json.loads(request.body or '{}')
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Invalid request.'}, status=400)

        full_name = (data.get('fullName') or '').strip()
        if full_name:
            name_parts = full_name.split(' ', 1)
            request.user.first_name = name_parts[0]
            request.user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        elif 'fullName' in data:
            request.user.first_name = ''
            request.user.last_name = ''

        if 'dob' in data:
            dob = (data.get('dob') or '').strip()
            if not dob:
                request.user.date_of_birth = None
            else:
                try:
                    request.user.date_of_birth = _dt.strptime(dob, '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({'ok': False, 'error': 'Invalid date format.'}, status=400)

        gender_map = {
            'male': 'M',
            'female': 'F',
            'other': 'O',
            'prefer not to say': '',
            '': '',
        }
        if 'gender' in data:
            raw_gender = (data.get('gender') or '').strip()
            request.user.gender = gender_map.get(raw_gender.casefold(), '')

        if 'phone' in data:
            request.user.phone_number = (data.get('phone') or '').strip()

        if 'nationality' in data:
            request.user.nationality = (data.get('nationality') or '').strip()

        request.user.save()
        return JsonResponse({'ok': True, 'profile': _profile_payload(request.user)})

    return JsonResponse({'ok': False, 'error': 'Method not allowed'}, status=405)


@login_required
def toggle_favorite(request, artifact_pk):
    artifact = get_object_or_404(Artifact, pk=artifact_pk)
    fav, created = UserFavorite.objects.get_or_create(user=request.user, artifact=artifact)
    if not created:
        fav.delete()
    return redirect(request.META.get('HTTP_REFERER', 'explore'))


# ─── Plan Your Visit ─────────────────────────────────────────────────────────

def plan_visit(request):
    visitor_type = request.GET.get('visitor_type')
    duration = request.GET.get('duration')
    plan = None
    if visitor_type and duration:
        plan = VisitPlan.objects.filter(
            visitor_type=visitor_type, duration=duration
        ).prefetch_related('stops').first()
    return render(request, 'museum/plan_visit.html', {
        'plan': plan,
        'visitor_type': visitor_type,
        'duration': duration,
    })


# ─── Contact API (JSON) ──────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def api_contact(request):
    from .models import ContactMessage
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'ok': False, 'error': 'Invalid request.'}, status=400)

    full_name = data.get('full_name', '').strip()
    email     = data.get('email', '').strip()
    subject   = data.get('subject', '').strip()
    message   = data.get('message', '').strip()
    rating    = data.get('rating')

    if not full_name or not email or not subject or not message:
        return JsonResponse({'ok': False, 'error': 'All fields are required.'}, status=400)

    ContactMessage.objects.create(
        full_name=full_name,
        email=email,
        subject=subject,
        message=message,
        rating=int(rating) if rating else None,
    )
    return JsonResponse({'ok': True})


# ─── Admin Stats API ─────────────────────────────────────────────────────────

def admin_stats(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    from .models import Exhibition, Booking, ContactMessage, NewsletterSubscription
    nationality_counts = Counter()
    nationality_labels = {}

    for raw_nationality in CustomUser.objects.values_list('nationality', flat=True):
        cleaned = (raw_nationality or '').strip()
        if cleaned:
            key = cleaned.casefold()
            nationality_counts[key] += 1
            nationality_labels.setdefault(key, cleaned)
        else:
            nationality_counts['__unspecified__'] += 1
            nationality_labels.setdefault('__unspecified__', 'Unspecified')

    top_nationalities = sorted(
        nationality_counts.items(),
        key=lambda item: (-item[1], nationality_labels[item[0]].casefold())
    )
    if len(top_nationalities) > 6:
        other_total = sum(count for _, count in top_nationalities[6:])
        top_nationalities = top_nationalities[:6] + [('__other__', other_total)]
        nationality_labels['__other__'] = 'Other'

    return JsonResponse({
        'artifacts': Artifact.objects.count(),
        'halls': Hall.objects.count(),
        'users': CustomUser.objects.count(),
        'bookings': Booking.objects.count(),
        'exhibitions': Exhibition.objects.count(),
        'messages_total': ContactMessage.objects.count(),
        'messages_unread': ContactMessage.objects.filter(is_read=False).count(),
        'newsletter_subscribers': NewsletterSubscription.objects.filter(is_active=True).count(),
        'recent_messages': list(
            ContactMessage.objects.order_by('-created_at').values(
                'id', 'full_name', 'subject', 'email', 'message', 'rating', 'is_read', 'created_at'
            )[:10]
        ),
        'nationality_distribution': [
            {
                'label': nationality_labels[key],
                'count': count,
            }
            for key, count in top_nationalities
        ],
    })


# ─── Dashboard CRUD APIs ─────────────────────────────────────────────────────

def _artifact_dict(a, request):
    return {
        'id': a.id, 'name': a.name, 'category': a.category,
        'category_display': a.get_category_display(),
        'era': a.era, 'year_discovered': a.year_discovered,
        'discovered_by': a.discovered_by, 'material': a.material,
        'date_label': a.date_label, 'description': a.description,
        'is_featured': a.is_featured,
        'hall_id': a.hall_id,
        'hall_name': a.hall.name if a.hall else None,
        'main_image': request.build_absolute_uri(a.main_image.url) if a.main_image else None,
    }


@csrf_exempt
def api_admin_artifacts(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        arts = Artifact.objects.select_related('hall').order_by('-is_featured', 'id')
        return JsonResponse({'artifacts': [_artifact_dict(a, request) for a in arts]})

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if not name:
            return JsonResponse({'ok': False, 'error': 'Name is required.'}, status=400)
        hall_id = request.POST.get('hall_id') or None
        hall = Hall.objects.get(pk=hall_id) if hall_id else None
        a = Artifact(
            name=name, hall=hall,
            category=request.POST.get('category', 'other'),
            era=request.POST.get('era', ''),
            year_discovered=request.POST.get('year_discovered') or None,
            discovered_by=request.POST.get('discovered_by', ''),
            material=request.POST.get('material', ''),
            date_label=request.POST.get('date_label', ''),
            description=request.POST.get('description', ''),
            is_featured=request.POST.get('is_featured') == 'true',
        )
        if 'main_image' in request.FILES:
            a.main_image = request.FILES['main_image']
        a.save()
        return JsonResponse({'ok': True, 'artifact': _artifact_dict(a, request)})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_artifact(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    a = get_object_or_404(Artifact, pk=pk)

    if request.method == 'GET':
        return JsonResponse(_artifact_dict(a, request))

    if request.method == 'POST':
        a.name = request.POST.get('name', a.name).strip() or a.name
        hall_id = request.POST.get('hall_id') or None
        a.hall = Hall.objects.get(pk=hall_id) if hall_id else None
        a.category = request.POST.get('category', a.category)
        a.era = request.POST.get('era', a.era)
        a.year_discovered = request.POST.get('year_discovered') or None
        a.discovered_by = request.POST.get('discovered_by', a.discovered_by)
        a.material = request.POST.get('material', a.material)
        a.date_label = request.POST.get('date_label', a.date_label)
        a.description = request.POST.get('description', a.description)
        a.is_featured = request.POST.get('is_featured') == 'true'
        if 'main_image' in request.FILES:
            a.main_image = request.FILES['main_image']
        a.save()
        return JsonResponse({'ok': True, 'artifact': _artifact_dict(a, request)})

    if request.method == 'DELETE':
        a.delete()
        return JsonResponse({'ok': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_halls(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        halls = Hall.objects.annotate(artifact_count=Count('artifacts')).order_by('name')
        return JsonResponse({'halls': [{
            'id': h.id, 'name': h.name,
            'era': h.era, 'era_display': h.get_era_display(),
            'theme': h.theme, 'theme_display': h.get_theme_display(),
            'sub_theme': h.sub_theme, 'description': h.description,
            'history_text': h.history_text, 'artifact_count': h.artifact_count,
        } for h in halls]})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        h = Hall.objects.create(
            name=data.get('name', '').strip(),
            era=data.get('era', 'old'),
            theme=data.get('theme', 'society'),
            sub_theme=data.get('sub_theme', ''),
            description=data.get('description', ''),
            history_text=data.get('history_text', ''),
        )
        return JsonResponse({'ok': True, 'id': h.id, 'name': h.name})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_hall(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    h = get_object_or_404(Hall, pk=pk)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        h.name = data.get('name', h.name).strip() or h.name
        h.era = data.get('era', h.era)
        h.theme = data.get('theme', h.theme)
        h.sub_theme = data.get('sub_theme', h.sub_theme)
        h.description = data.get('description', h.description)
        h.history_text = data.get('history_text', h.history_text)
        h.save()
        return JsonResponse({'ok': True})

    if request.method == 'DELETE':
        h.delete()
        return JsonResponse({'ok': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_messages(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    msgs = list(ContactMessage.objects.order_by('-created_at').values(
        'id', 'full_name', 'email', 'subject', 'message', 'rating', 'is_read', 'created_at'
    ))
    return JsonResponse({'messages': msgs})


@csrf_exempt
def api_admin_message(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    msg = get_object_or_404(ContactMessage, pk=pk)
    if request.method == 'POST':
        msg.is_read = True
        msg.save()
        return JsonResponse({'ok': True})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_users(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    users = list(CustomUser.objects.order_by('-date_joined').values(
        'id', 'email', 'first_name', 'last_name', 'nationality', 'date_joined', 'is_active', 'is_staff'
    ))
    return JsonResponse({'users': users})


@csrf_exempt
def api_admin_user(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    user = get_object_or_404(CustomUser, pk=pk)

    if request.method == 'POST':
        try:
            data = json.loads(request.body or '{}')
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Invalid request.'}, status=400)

        user.nationality = (data.get('nationality') or '').strip()
        user.save(update_fields=['nationality'])
        return JsonResponse({'ok': True, 'nationality': user.nationality})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_bookings(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    bookings = list(Booking.objects.order_by('-created_at').values(
        'id', 'full_name', 'email', 'mobile', 'nationality',
        'visit_date', 'entry_time', 'tour_language',
        'promo_code', 'subtotal', 'discount', 'total_amount',
        'status', 'created_at',
    ))
    return JsonResponse({'bookings': bookings})


@csrf_exempt
def api_admin_booking(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    b = get_object_or_404(Booking, pk=pk)
    if request.method == 'POST':
        try:
            data = json.loads(request.body or '{}')
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Invalid request.'}, status=400)
        status = data.get('status', '').strip()
        if status in ('pending', 'confirmed', 'cancelled'):
            b.status = status
            b.save(update_fields=['status'])
            return JsonResponse({'ok': True, 'status': b.status})
        return JsonResponse({'ok': False, 'error': 'Invalid status.'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── Exhibitions CRUD ─────────────────────────────────────────────────────────

def _exhibition_dict(e, request):
    from django.utils import timezone as tz
    today = tz.now().date()
    if today < e.start_date:
        status = 'upcoming'
    elif today > e.end_date:
        status = 'past'
    else:
        status = 'active'
    return {
        'id': e.id, 'name': e.name, 'description': e.description,
        'start_date': e.start_date.isoformat(), 'end_date': e.end_date.isoformat(),
        'location_in_museum': e.location_in_museum, 'is_featured': e.is_featured,
        'cover_image': request.build_absolute_uri(e.cover_image.url) if e.cover_image else None,
        'status': status,
    }


@csrf_exempt
def api_admin_exhibitions(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        exs = Exhibition.objects.order_by('-start_date')
        return JsonResponse({'exhibitions': [_exhibition_dict(e, request) for e in exs]})

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if not name:
            return JsonResponse({'ok': False, 'error': 'Name is required.'}, status=400)
        try:
            start_date = _dt.strptime(request.POST.get('start_date', ''), '%Y-%m-%d').date()
            end_date = _dt.strptime(request.POST.get('end_date', ''), '%Y-%m-%d').date()
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Valid start and end dates are required.'}, status=400)
        e = Exhibition(
            name=name,
            description=request.POST.get('description', ''),
            start_date=start_date,
            end_date=end_date,
            location_in_museum=request.POST.get('location_in_museum', ''),
            is_featured=request.POST.get('is_featured') == 'true',
        )
        if 'cover_image' in request.FILES:
            e.cover_image = request.FILES['cover_image']
        e.save()
        return JsonResponse({'ok': True, 'exhibition': _exhibition_dict(e, request)})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_exhibition(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    e = get_object_or_404(Exhibition, pk=pk)

    if request.method == 'GET':
        return JsonResponse(_exhibition_dict(e, request))

    if request.method == 'POST':
        e.name = request.POST.get('name', e.name).strip() or e.name
        e.description = request.POST.get('description', e.description)
        e.location_in_museum = request.POST.get('location_in_museum', e.location_in_museum)
        e.is_featured = request.POST.get('is_featured') == 'true'
        try:
            if request.POST.get('start_date'):
                e.start_date = _dt.strptime(request.POST.get('start_date'), '%Y-%m-%d').date()
            if request.POST.get('end_date'):
                e.end_date = _dt.strptime(request.POST.get('end_date'), '%Y-%m-%d').date()
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Invalid dates.'}, status=400)
        if 'cover_image' in request.FILES:
            e.cover_image = request.FILES['cover_image']
        e.save()
        return JsonResponse({'ok': True, 'exhibition': _exhibition_dict(e, request)})

    if request.method == 'DELETE':
        e.delete()
        return JsonResponse({'ok': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── Ticket Types CRUD ────────────────────────────────────────────────────────

def _ticket_dict(t):
    return {
        'id': t.id, 'name': t.name,
        'nationality_category': t.nationality_category,
        'nationality_display': t.get_nationality_category_display(),
        'visitor_category': t.visitor_category,
        'visitor_display': t.get_visitor_category_display(),
        'price': str(t.price),
        'description': t.description,
        'is_active': t.is_active,
    }


@csrf_exempt
def api_admin_tickets(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        tickets = TicketType.objects.order_by('nationality_category', 'visitor_category')
        return JsonResponse({'tickets': [_ticket_dict(t) for t in tickets]})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'ok': False, 'error': 'Name is required.'}, status=400)
        t = TicketType.objects.create(
            name=name,
            nationality_category=data.get('nationality_category', 'egyptian'),
            visitor_category=data.get('visitor_category', 'adult'),
            price=data.get('price', 0),
            description=data.get('description', ''),
            is_active=data.get('is_active', True),
        )
        return JsonResponse({'ok': True, 'ticket': _ticket_dict(t)})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_ticket(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    t = get_object_or_404(TicketType, pk=pk)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        t.name = data.get('name', t.name).strip() or t.name
        t.nationality_category = data.get('nationality_category', t.nationality_category)
        t.visitor_category = data.get('visitor_category', t.visitor_category)
        t.price = data.get('price', t.price)
        t.description = data.get('description', t.description)
        t.is_active = data.get('is_active', t.is_active)
        t.save()
        return JsonResponse({'ok': True, 'ticket': _ticket_dict(t)})

    if request.method == 'DELETE':
        try:
            t.delete()
            return JsonResponse({'ok': True})
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Cannot delete: ticket is used in bookings.'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── Add-ons CRUD ─────────────────────────────────────────────────────────────

def _addon_dict(a):
    return {
        'id': a.id, 'name': a.name,
        'description': a.description,
        'price': str(a.price),
        'is_active': a.is_active,
    }


@csrf_exempt
def api_admin_addons(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    if request.method == 'GET':
        addons = AddOn.objects.order_by('name')
        return JsonResponse({'addons': [_addon_dict(a) for a in addons]})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'ok': False, 'error': 'Name is required.'}, status=400)
        a = AddOn.objects.create(
            name=name,
            description=data.get('description', ''),
            price=data.get('price', 0),
            is_active=data.get('is_active', True),
        )
        return JsonResponse({'ok': True, 'addon': _addon_dict(a)})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_admin_addon(request, pk):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    a = get_object_or_404(AddOn, pk=pk)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except Exception:
            data = {}
        a.name = data.get('name', a.name).strip() or a.name
        a.description = data.get('description', a.description)
        a.price = data.get('price', a.price)
        a.is_active = data.get('is_active', a.is_active)
        a.save()
        return JsonResponse({'ok': True, 'addon': _addon_dict(a)})

    if request.method == 'DELETE':
        try:
            a.delete()
            return JsonResponse({'ok': True})
        except Exception:
            return JsonResponse({'ok': False, 'error': 'Cannot delete: add-on is used in bookings.'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── Newsletter Subscribers (read-only) ──────────────────────────────────────

def api_admin_newsletter(request):
    if not _is_staff(request):
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    subs = list(NewsletterSubscription.objects.order_by('-subscribed_at').values(
        'id', 'email', 'subscribed_at', 'is_active'
    ))
    return JsonResponse({'subscribers': subs})


# ─── Booking API ─────────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def api_booking(request):
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({'ok': False, 'error': 'Invalid JSON'}, status=400)

    # Parse date "April 26, 2026"
    try:
        visit_date = _dt.strptime(data.get('date', ''), '%B %d, %Y').date()
    except Exception:
        return JsonResponse({'ok': False, 'error': 'Invalid date.'}, status=400)

    # Parse time "08:30 AM - 11:00 AM" or "10:15 AM"
    raw_time = data.get('time', '').split(' - ')[0].strip()
    entry_time = _time(8, 0)
    for fmt in ('%I:%M %p', '%H:%M'):
        try:
            entry_time = _dt.strptime(raw_time, fmt).time()
            break
        except Exception:
            pass

    contact = data.get('contact', {})
    tour_lang = (data.get('tour_language') or 'english').lower()
    valid_langs = {'arabic', 'english', 'french', 'spanish', 'german'}
    if tour_lang not in valid_langs:
        tour_lang = 'english'

    booking = Booking.objects.create(
        user=request.user if request.user.is_authenticated else None,
        full_name=contact.get('name', ''),
        email=contact.get('email', ''),
        mobile=contact.get('mobile', ''),
        nationality=contact.get('nationality', ''),
        visit_date=visit_date,
        entry_time=entry_time,
        tour_language=tour_lang,
        promo_code=data.get('promo_code', ''),
        subtotal=data.get('subtotal', 0),
        discount=data.get('discount', 0),
        total_amount=data.get('total_amount', 0),
        status='confirmed',
    )
    return JsonResponse({'ok': True, 'booking_id': booking.id})


# ─── Newsletter ──────────────────────────────────────────────────────────────

def newsletter_subscribe(request):
    if request.method == 'POST':
        form = NewsletterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Subscribed successfully!')
        else:
            messages.error(request, 'This email is already subscribed.')
    return redirect(request.META.get('HTTP_REFERER', 'home'))
