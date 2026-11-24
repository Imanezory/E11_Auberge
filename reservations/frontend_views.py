
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required(login_url='/login/')
def reservation_frontend(request):
    return render(request, 'reservations/react_app.html')


@login_required(login_url='/login/')
def facture_payment_frontend(request, pk):
    return render(request, 'reservations/react_app.html')
