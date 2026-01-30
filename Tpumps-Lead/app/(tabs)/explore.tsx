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
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">More than 5 Hours:{' '}</ThemedText>One unpaid 30-minute break and one 10-minute break.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">More than 6 Hours:{' '}</ThemedText>One unpaid 30-minute break and two 10-minute breaks.</ThemedText>
      </Collapsible>
      <Collapsible title="How to Make A Sample Batch For Customers">
        <ThemedText>
          Here's the general guideline for making a sample batch:
        </ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Tea: </ThemedText>4 Quarts.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Creamer:{' '}</ThemedText>1/4 of a can if making a milk tea.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Fructose:{' '}</ThemedText>650.</ThemedText>
        <ThemedText>• <ThemedText type="defaultSemiBoldUnderline">Flavors:{' '}</ThemedText>3 Cups Total (1 Cup per flavor, or 1.5 cups for lighter flavors like rose or guava).</ThemedText>
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
          <ThemedText type="defaultSemiBoldUnderline">• Be sure to soap and rinse the sink itself</ThemedText>
          <ThemedText type="defaultSemiBoldUnderline">• Also rinse off yellow rags that were used to wipe down the stations, and place them in the red bucket filled with a solution of bleach (1 cap full) and water.</ThemedText>
        </Collapsible>
        <Collapsible title="Floors & Trash 🗑️">
          <ThemedText>
            <ThemedText>• Ensure that there all recycling and trash cans are thrown out in their respective bins</ThemedText>
            <ThemedText>• Use the correct mop buckets for rinsing and prepping the mops when cleaning the floors (yellow bucket for dirty water, grey bucket for soapy water)</ThemedText>
            <ThemedText>• When creating soap solution for the mops, try to conserve amount of fabuloso soap used (usually a splash or two will do the trick).</ThemedText>
            <ThemedText>• Soap the sample cart and dump contents of the bucket that is within the cart into the drain where the soap bucket usually is.</ThemedText>
            <ThemedText>• Rinse mops in bleach water after all floors are clean, and be sure to squeeze all water out before hanging them back up.</ThemedText>
            <ThemedText>• Please don't try to mop everything after dipping the mop in the soap water only one time. It will stink up the store and end up only spreading dirt. 🤢</ThemedText>
            <ThemedText>• Also PLEASE squeegee the puddle of water that accumulates under the dish rack and mop the area afterwards. Otherwise, it will create a stench that lingers. 🤢</ThemedText>
            <ThemedText>• Clean large drain catch basins under the tea station, topping/pump station, the boba sink, and the dish sink. Usually, these are the areas that accumulate boba and tea leaves throughout the shift which can create mold if left uncleaned overnight.</ThemedText>
          </ThemedText>
        </Collapsible>
        <Collapsible title="Counting the Register 🏧">
            <ThemedText>• End the cash drawer out front once your shift is over and note the cash total within the cash drawer report.</ThemedText>
            <ThemedText>• Count your drawer using the bill counter and coin counter. Be sure that the total matches what's on the cash drawer report and write these values on the cash report</ThemedText>
              <ThemedText>  ◦ Be sure to place one type of coin at a time, as the counter may incorrectly classify coins as other types.</ThemedText>
              <ThemedText>  ◦ If the coin counter jams, lift the top and see if you can dislodge any coins</ThemedText>
            <ThemedText>• Take out the cash sales from your drawer (this amount is stated in the cash report). Afterwards, your drawer should contain $150.</ThemedText>
            <ThemedText>• Count that the morning's cash sales matches what they have written down on the report</ThemedText>
            <ThemedText>• Combine the total cash sales and ensures that they add up to the sum of cash sales values written on the report.</ThemedText>
            <ThemedText>• Record all totals and bill amounts in their respective places on the cash report and the check</ThemedText>
        </Collapsible>
        <Collapsible title="Counting the Safe 💰">
          <ThemedText>• Count the safe and record it on the cash report (Usually the total is 1,000)</ThemedText>
          <ThemedText>• Count the bills and coins in the safe and record it on the cash report. A rubber band of bills means there are 20 of that bill. So a band of $1 bills is worth $20, and a band of $5 bills is worth $100. Sometimes there is a rubber band of 5 rubber banded bunches of bills, which means there are 100 of that bill. You can do the math for yourself to figure out the total value of these.</ThemedText>
          <ThemedText>• When all is counted and the total is 1,000, then record the bill amounts and values on the cash report, along with the verified total within the safe.</ThemedText>
        </Collapsible>
        <Collapsible title="Creating Deposit Check Envelope">
          <ThemedText>• There is a template of a proper check hung up on the wall within the office room that you can use to fill out the check correctly.</ThemedText>
          <ThemedText>• The check should be filled out with the correct date, the correct cash sales amount, and the correct payee.</ThemedText>
          <ThemedText>• When placing the check in the envelope, also place the cash sales from your shift. The bank likes it when you give them fewer larger bills as opposed to many smaller bills, so try to consolidate smaller bills into larger ones (i.e. a $20 bill instead of 4 $5 bills or 2 $10 bills).</ThemedText>
          <ThemedText>• Write the current date along with the cash sales amount below the date on the top right corner of the front of the envelope. Then place the envelope into the blue chase bank deposit bag within the safe.</ThemedText>
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