from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, ContactMessage, Booking, NewsletterSubscription


class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True)
    full_name = forms.CharField(max_length=200)

    class Meta:
        model = CustomUser
        fields = ('full_name', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        name_parts = self.cleaned_data['full_name'].split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['email']
        if commit:
            user.save()
        return user


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'nationality', 'avatar')
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
        }


class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ('full_name', 'email', 'subject', 'message', 'rating')
        widgets = {
            'message': forms.Textarea(attrs={'rows': 5}),
            'rating': forms.RadioSelect(),
        }


class BookingStep3Form(forms.Form):
    full_name = forms.CharField(max_length=200)
    email = forms.EmailField()
    mobile = forms.CharField(max_length=20)
    nationality = forms.CharField(max_length=100)


class NewsletterForm(forms.ModelForm):
    class Meta:
        model = NewsletterSubscription
        fields = ('email',)
