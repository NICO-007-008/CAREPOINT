#!/usr/bin/env python3
"""
Shows the receipt page after a successful GCash payment (app and website copies).
Before: GCash orders jumped straight to "My Orders".
After:  GCash orders open the same receipt page as the other payment methods.

Usage:   python fix_gcash_receipt.py index.html
A backup is saved as index.html.bak before anything is changed.
"""
import sys, shutil

path = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
shutil.copyfile(path, path + '.bak')
src = open(path, encoding='utf-8').read()

old = "if (state.session.customer === pending.customerId) state.customer.view = 'orders';"
new = ("if (state.session.customer === pending.customerId) {\n"
       "                state.customer.view = 'receipt';\n"
       "                state.customer.orderId = id;\n"
       "            }")

if new in src:
    sys.exit('Already patched - nothing to do.')
if old not in src:
    sys.exit('Could not find the GCash order code (finalizePendingOrder).')

src = src.replace(old, new, 1)
open(path, 'w', encoding='utf-8').write(src)
print('OK  GCash orders now open the receipt page')
print('Done. Backup saved as ' + path + '.bak')
