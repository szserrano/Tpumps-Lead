import { StyleSheet, Image, Platform, View} from 'react-native';
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/tpumps-450x277.jpg')}
          style={styles.tpumpsHeaderPicture}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Tips & Tricks</ThemedText>
      </ThemedView>
      <ThemedText>This page includes some tips compiled from other leads that helped them run the store efficiently. Tips for specific store locations may come soon!</ThemedText>
      <Collapsible title="How to Respond to Questions About Catering Orders">
        <ThemedText type="default">
          "We just make the orders, but from what we've seen, people order rental tanks and/or a certain number of drinks for them. 
          If you have any questions, send them over to our catering department's email:{' '}<ThemedText type="defaultSemiBoldUnderline">catering@tpumps.com</ThemedText>."
        </ThemedText>
        <ThemedText type="defaultSemiBoldUnderline">People usually have catering orders for:</ThemedText>
        <ThemedText>• Birthdays</ThemedText>
        <ThemedText>• Weddings</ThemedText>
        <ThemedText>• School Events and Fundraisers</ThemedText>
        
      </Collapsible>
      <Collapsible title="How many breaks do my workers have?">
        <ThemedText>
          Here's the general breakdown of worker's breaks:
        </ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Less than 5 Hours: </ThemedText>One 10-minute break.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Between 5 Hours and 30 Minutes and 6 Hours:{' '}</ThemedText>One unpaid 30-minute break and one 10-minute break.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">More than 6 Hours:{' '}</ThemedText>One unpaid 30-minute break and two 10-minute breaks.</ThemedText>
      </Collapsible>
      <Collapsible title="How to Make A Sample Batch For Customers">
        <ThemedText>
          Here's the general guideline for making a sample batch:
        </ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Tea: </ThemedText>4 Quarts.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Creamer:{' '}</ThemedText>1/4 of a can if making a milk tea.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Fructose:{' '}</ThemedText>650.</ThemedText>
      </Collapsible>
      <Collapsible title="Closing Tasks">
        <ThemedText>
          There are a few closing tasks that you need to check before you all clock out from your closing shifts: 
        </ThemedText>
        <Collapsible title="Stations ☕">
          <ThemedText>
            <ThemedText type="defaultSemiBold">• Soap and Clean</ThemedText>
            <ThemedText>  ◦ Main Bar</ThemedText>
            <ThemedText>  ◦ Tea Tank Bar</ThemedText>
            <ThemedText>  ◦ Toppings Fridge (Including crossarms that hold the toppings)</ThemedText>
            <ThemedText>  ◦ Main Syrup Cart</ThemedText>
            <ThemedText>  ◦ Opened Syrup Cart</ThemedText>
            <ThemedText>  ◦ Boba Kitchen</ThemedText>
            <ThemedText>  ◦ Boba Sink</ThemedText>
            <ThemedText type="defaultSemiBold">• Cover the toppings containers in the toppings fridge with saran wrap</ThemedText>
            <ThemedText type="defaultSemiBold">• Rinse and Wipe Syrup Bottles (Opened and Main)</ThemedText>
          </ThemedText>
        </Collapsible>
        <Collapsible title="Dishes 🫧">
          <ThemedText type="defaultSemiBoldUnderline">• Ensure dishes don't have any boba residue on them and are placed on drying racks</ThemedText>
        </Collapsible>
        <Collapsible title="Floors & Trash 🗑️">
          <ThemedText>
            <ThemedText>• Ensure that there all recycling and trash cans are thrown out in their respective bins</ThemedText>
            <ThemedText>• Use the correct mop buckets for rinsing and prepping the mops when cleaning the floors (yellow bucket for dirty water, grey bucket for soapy water)</ThemedText>
            <ThemedText>• Soap the sample cart and toss the bucket inside the cart.</ThemedText>
            <ThemedText>• Rinse mops in bleach water after all floors are clean, and be sure to squeeze all water out before hanging them back up.</ThemedText>
            <ThemedText>• Please don't try to mop everything after dipping the mop in the soap water only one time. It will stink up the store and end up only spreading dirt. 🤢</ThemedText>
          </ThemedText>
        </Collapsible>
        <Collapsible title="Counting the Register 🏧">
            <ThemedText>• Count the safe and record it on the cash report (Usually the total is 1,000)</ThemedText>
            <ThemedText>• End the cash drawer out front once your shift is over and note the cash total within the cash drawer report.</ThemedText>
            <ThemedText>• Count your drawer using the bill counter and coin counter. Be sure that the total matches what's on the cash drawer report and write these values on the cash report</ThemedText>
              <ThemedText>  ◦ Be sure to place one type of coin at a time, as the counter may incorrectly classify coins as other types.</ThemedText>
              <ThemedText>  ◦ If the coin counter jams, lift the top and see if you can dislodge any coins</ThemedText>
            <ThemedText>• Take out the cash sales from your drawer (this amount is stated in the cash report)</ThemedText>
            <ThemedText>• Count that the morning's cash sales matches what they have written down on the report</ThemedText>
            <ThemedText>• Combine the total cash sales and ensures that they add up to the sum of cash sales values written on the report.</ThemedText>
            <ThemedText>• Record all totals and bill amounts in their respective places on the cash report and the check</ThemedText>
        </Collapsible>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tpumpsHeaderPicture: {
    height: 250,
    width: 390,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  bulletPoint: {
    padding: 5,
  },
  middle: {
    flex: 1,
    backgroundColor: 'beige',
    borderWidth: 5,
  },
});