import tweepy
import os
import random
import time
import cryptocode
from dotenv import load_dotenv
load_dotenv()


ENCODE_KEY = "encrypt"
NUM_LIKE = 10


def get_client():
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    access_token = os.getenv("TWITTER_ACCESS_TOKEN")
    access_token_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
    bearer_token = os.getenv("BEARER_TOKEN")
    return tweepy.Client(bearer_token, api_key, api_secret, access_token, access_token_secret)


def get_encoded_username_list():
    with open("encoded_username.csv", "r") as f:
        data = f.read()
        return data.splitlines()


def exec_like(client: tweepy.Client, encoded_username: str):
    try:
        username = cryptocode.decrypt(encoded_username, ENCODE_KEY)
        user_info = client.get_user(username=username)
        userid = user_info.data["id"]
        tweet_list = client.get_users_tweets(id=userid, exclude="replies,retweets")
        if not tweet_list.data:
            return
        target_tweet_id = tweet_list.data[0]["id"]
        client.like(target_tweet_id)
    except Exception as e:
        print(e)
        return


if __name__ == "__main__":
    client = get_client()
    encoded_username_list = get_encoded_username_list()
    filtered_encoded_username_list = random.sample(encoded_username_list, NUM_LIKE)
    for encoded_username in filtered_encoded_username_list:
        exec_like(client, encoded_username)
        time.sleep(5)
