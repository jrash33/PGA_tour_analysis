#import modules
import pandas as pd
from splinter import Browser
from bs4 import BeautifulSoup
import requests
import time

#FUNCTIONS
#function that takes desired variables with your list of dictionaries scraped and returns a clean list of these variables
def get_vars(stats, vars_wanted):
    stats_vars = []
    items=[]
    #iterate through scraped data to find desired variables
    for list_item in stats:
        dict_item = [value for key,value in list_item.items()]
        if dict_item[0] in vars_wanted:
            #check for duplicates
            if dict_item not in items:
                items.append(dict_item)
                stats_vars.append(list_item)
    return stats_vars


#---------------------------------------------------------------------------------------------------------------------------
#MAIN

#URL of page to be scraped
url = 'https://www.pgatour.com/players.html'

#Retrieve page with the requests module
response = requests.get(url)

#create BeautifulSoup object; parse w 'html.parser'
soup = BeautifulSoup(response.text, 'html.parser')


#SCRAPE LINK TO EACH PLAYER STAT PAGE***********************************
#get names of all the player links
#retrieve the parent divs for all links
players = soup.find_all('span',class_="name")

#create empty list to accept data
player_names = []
player_url = []

#loop through each parent div and grab the link to the player stat page
for player in players:
    #get name of player
    player_names.append(player.a.text)
    #get url for player performance page
    player_url.append(player.a['href'])


#SCRAPE PGA PERFORMANCE DATA FOR EACH INDIVIDUAL PLAYER******************
base_url = 'https://www.pgatour.com'

#execute chromedriver
executable_path = {'executable_path': 'chromedriver.exe'}
browser = Browser('chrome', **executable_path, headless=False)

#master data set
DATA = []

for player,url in zip(player_names,player_url):
    scrape_url = base_url + url

    #SPLINTER
    browser.visit(scrape_url)

    try:
        browser.click_link_by_partial_text("Performance")
        time.sleep(1)
    
        html = browser.html
        soup = BeautifulSoup(html, 'html.parser')   

        #photo of player
        try:
            photo_url = soup.find('img', class_='photo')['src']
            player_intro = [{'Player Name': player, 'photo_url': photo_url}]
        except TypeError:
            player_intro = [{'Player Name': player, 'photo_url': 'none'}]

        #scrape all html hstat code
        info = soup.findAll('div', class_='item')

        #headline stats
        info_stats = []

        for i in info:
            try:
                #get stat name
                caption = i.find('div',class_='denotation').text
                #get stat value
                value = i.find('div', class_='value').text
                #clean up text
                value = value.replace('\xa0','')
                value = value.replace('\n','')
                #save to dictionary
                post = {'caption':caption, 'value': value}
                #append to list
                info_stats.append(post)
            except AttributeError:
                nothing = 0
        
        #scrape all html hstat code
        hstats = soup.findAll('div', class_='stat')

        #headline stats
        h_stats = []
        for hstat in hstats:
            try:
                #get stat name
                caption = hstat.find('div',class_='caption').text
                #get stat value
                value = hstat.find('div',class_='value').text
                
                #save to dictionary
                post = {'caption':caption, 'value': value}

                #append to list
                h_stats.append(post)
            except AttributeError:
                nothing = 0

        #scrape all html astat code
        astats = soup.findAll('tr')

        #attribute stats
        a_stats = []

        for astat in astats:
            try:
                #get the stat name
                caption = astat.find('td',class_='caption').text
                #get stat value
                value = astat.find('td',class_='value').text
                
                #save to dictionary
                post = {'caption':caption, 'value': value}
                
                #append to list
                a_stats.append(post)
            except AttributeError:
                nothing = 0

        #scrape for additional needed info
        extrastats = soup.findAll('td')

        #attribute stats
        extra_stats = []

        for extra in extrastats:
            try:
                #get the stat name
                text = extra.text
                #append to list
                extra_stats.append(text)
            except AttributeError:
                nothing=0

        
        #these attributes are unique with no captions/values-All string format
        #search sub_strings of desired variables for values
        sub_strings = ['Total Left rough', 'Total Right rough', 'Possible Fwys', 'Distance Rank', 'Accuracy Rank',
            'Total Club Head Speed', 'Total Attempts']

        extra_stats_var= []
        for sub in sub_strings:
            x = [s for s in extra_stats if sub in s]
            if x:
                x = x[0].split(':')
                x[1] = x[1].replace(' ','')

                post = {'caption': x[0], 'value': x[1]}
                extra_stats_var.append(post)
            else:
                nothing=0

        #variables wanted from info stats
        info_var = ['Height', 'Weight', 'AGE', 'Turned Pro', 'College', 'Birthplace' ,'FEDEXCUP Rank', 'FEDEXCUP Points', 'Scoring Average']
        #variables wanted from headline stats
        h_var = ['Total Distance', 'Total Drives', '# of Drives', 'Fairways Hit', 'Possible Fairways', 'Measured Rounds']
        #variables wanted from additional stats
        a_var = ['Driving Distance','Driving Accuracy Percentage','Total Driving','Club Head Speed',
                'Distance from Edge of Fairway','Left Rough Tendency','Right Rough Tendency','Total Driving Efficiency']
        extra_var = ['Total Left rough', 'Total Right rough', 'Possible Fwys', 'Distance Rank', 'Accuracy Rank',
            'Total Club Head Speed', 'Total Attempts']

        info_stats_vars = get_vars(info_stats, info_var)
        h_stats_vars = get_vars(h_stats, h_var)
        a_stats_vars = get_vars(a_stats, a_var)
        extra_stats_vars = get_vars(extra_stats_var, sub_strings)

        #combine all stat variables
        all_stat_var = info_stats_vars + h_stats_vars + a_stats_vars + extra_stats_vars

        bla = soup.findAll('div', class_ = 'holder')
        dates_ = soup.findAll('td', class_ = 'date')
        rounds = soup.findAll('td', class_='round')

        tourney_name = []
        all_text = []
        scores = []
        to_par = []
        pos = []
        dates = []

        for i in bla:
            x = i.find('tbody')
            #tourney info
            tourneys = x.findAll('p')
            #need this for all text
            tds = x.findAll('td')
            #get all text to use later for pos
            [all_text.append(td.text) for td in tds]
            
            #tournament names
            [tourney_name.append(j.text) for j in tourneys]

        #clean dates
        [dates.append(d.text) for d in dates_]
        #scores of each round in increments of 4 ('--' means no score)
        [scores.append(r.text) for r in rounds]
        #now append tournament position results by getting list item after tournament name
        [pos.append(all_text[all_text.index(tourney)+1]) for tourney in tourney_name]
        #now append tournament position results by getting list item after tournament name
        [to_par.append(all_text[all_text.index(tourney)+8]) for tourney in tourney_name]

        #create final dictionary of tournaments for the past year
        tournament_history = []
        for date,tourney,score,rank in zip(dates,tourney_name,to_par,pos):
            try:
                #create dictionary with all info
                post = {'Date':date, 
                        'Tournament Name':tourney, 
                        'Total Score':score, 
                        'POS':rank}
                #append to final list
                tournament_history.append(post)
            except AttributeError:
                nothing=0

        #output list
        player_final = {}
        player_final['player_intro'] = player_intro
        player_final['all_stat_var'] = all_stat_var
        player_final['tournament_hist'] = tournament_history

        DATA.append(player_final)
        print(f"Player Data Successfully Acquired!: {player}")
    
    except ElementDoesNotExist:
        print(f"!!!!!!!!!!!!!!Data Retrieval Unsuccessful: {player}")







