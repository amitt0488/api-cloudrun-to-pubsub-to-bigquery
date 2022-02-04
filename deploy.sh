GOOGLE_PROJECT_ID=dog-breed-api

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/barkbarkapi \
  --project=$GOOGLE_PROJECT_ID

gcloud beta run deploy barkbark-api \
  --image gcr.io/$GOOGLE_PROJECT_ID/barkbarkapi \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --project=$GOOGLE_PROJECT_ID