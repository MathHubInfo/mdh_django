import json
import sys

from django.core.management.base import BaseCommand

from ...models import Collection


class Command(BaseCommand):
    help = 'Creates or updates a collection. '

    def add_arguments(self, parser):
        parser.add_argument('filename', help=".json file with serialized collection data")
        parser.add_argument('--update', '-u', dest='update', action='store_true', help="When set, update collection instead of provinding a new one. ")
        parser.add_argument('--quiet', '-q', action='store_true', help="Do not produce any output in case of success")

    def handle(self, *args, **kwargs):
        # create a logger
        if not kwargs['quiet']:
            logger = lambda m:sys.stdout.write(m + "\n")
        else:
            logger = None
        
        # open the file and read json
        value = None
        with open(kwargs['filename']) as f:
            value = json.load(f)
        
        # and create the object
        Collection.objects.create_or_update_from_serializer(value, update = kwargs['update'], logger=logger)